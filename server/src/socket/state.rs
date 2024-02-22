use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use tracing::error;

use crate::room::Room;

pub struct SocketState {
    rooms: Arc<Mutex<HashMap<String, Room>>>,
}

impl SocketState {
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    pub fn add(&self, room_id: String, room: Room) {
        let mut map = self
            .rooms
            .lock()
            .map_err(|e| {
                error!("Error locking mutex: {:?}", e);
            })
            .unwrap();
        map.insert(room_id, room);
    }
    pub fn update(&self, room_id: String, room: Room) {
        let mut map = self
            .rooms
            .lock()
            .map_err(|e| {
                error!("Error locking mutex: {:?}", e);
            })
            .unwrap();
        map.insert(room_id, room);
    }
    pub fn remove(&self, room_id: String) {
        let mut map = self
            .rooms
            .lock()
            .map_err(|e| {
                error!("Error locking mutex: {:?}", e);
            })
            .unwrap();
        map.remove(&room_id);
    }
    pub fn get(&self, room_id: String) -> Option<Room> {
        let map = self
            .rooms
            .lock()
            .map_err(|e| {
                error!("Error locking mutex: {:?}", e);
            })
            .unwrap();
        map.get(&room_id).cloned()
    }
    pub fn get_all(&self) -> Vec<Room> {
        let map = self
            .rooms
            .lock()
            .map_err(|e| {
                error!("Error locking mutex: {:?}", e);
            })
            .unwrap();
        map.values().cloned().collect()
    }
}
