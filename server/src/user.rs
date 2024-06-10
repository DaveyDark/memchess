use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::time::Duration;
use tokio::{sync::Mutex, task::JoinHandle, time::sleep};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct User {
    id: String,
    name: String,
    avatar: String,
    avatar_orientation: u8,
    avatar_color: String,
    chess_color: String,
    connected: bool,
    #[serde(skip)]
    time: Arc<Mutex<u64>>, // time left in seconds
    #[serde(skip)]
    timer_handle: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl User {
    pub fn new(
        id: String,
        name: String,
        avatar: String,
        avatar_orientation: u8,
        avatar_color: String,
        chess_color: String,
        initial_time: u64,
    ) -> Self {
        Self {
            id,
            name,
            avatar,
            avatar_orientation,
            avatar_color,
            chess_color,
            connected: true,
            time: Arc::new(Mutex::new(initial_time)),
            timer_handle: Arc::new(Mutex::new(None)),
        }
    }

    pub fn get_id(&self) -> String {
        self.id.clone()
    }

    pub fn set_chess_color(&mut self, color: String) {
        self.chess_color = color;
    }

    pub fn get_chess_color(&self) -> String {
        self.chess_color.clone()
    }

    pub async fn get_time(&self) -> u64 {
        *self.time.lock().await
    }

    pub async fn start_turn(&self) {
        let time = self.time.clone();
        let mut handle = self.timer_handle.lock().await;

        // Abort any existing timer
        if let Some(handle) = handle.take() {
            handle.abort();
        }

        // Start a new timer
        *handle = Some(tokio::spawn(async move {
            loop {
                sleep(Duration::from_secs(1)).await;
                let mut time = time.lock().await;
                if *time > 0 {
                    *time -= 1;
                } else {
                    break;
                }
            }
        }));
    }

    pub async fn end_turn(&self) {
        let mut handle = self.timer_handle.lock().await;
        if let Some(handle) = handle.take() {
            handle.abort();
        }
    }

    pub async fn reset_time(&self, time: u64) {
        *self.time.lock().await = time;
    }

    pub fn disconnect(&mut self) {
        self.connected = false;
    }

    pub fn is_connected(&self) -> bool {
        self.connected
    }

    pub fn reconnect(&mut self, id: String) {
        self.connected = true;
        self.id = id;
    }

    pub fn matches(
        &self,
        name: &String,
        avatar: &String,
        avatar_orientation: &u8,
        avatar_color: &String,
    ) -> bool {
        self.name == *name
            && self.avatar == *avatar
            && self.avatar_orientation == *avatar_orientation
            && self.avatar_color == *avatar_color
    }
}
