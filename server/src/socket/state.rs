use std::collections::HashMap;

use tokio::sync::RwLock;

use crate::room::Room;

pub struct SocketState {
    // Main state of the app
    // Stores Room objects for each active room
    // RwLock ensures safe concurrent mutability and access across threads
    pub rooms: RwLock<HashMap<String, Room>>,
}

impl SocketState {
    pub fn new() -> Self {
        // Returns a new empty SocketState
        Self {
            rooms: RwLock::new(HashMap::new()),
        }
    }
    pub async fn add(&self, room_id: String, room: Room) {
        // Adds a new Room to the state with a given room_id
        let mut map = self.rooms.write().await;
        map.insert(room_id, room);
    }
    pub async fn update(&self, room_id: String, room: Room) {
        // Updates a Room in the state with a given room_id
        let mut map = self.rooms.write().await;
        map.insert(room_id, room);
    }
    pub async fn remove(&self, room_id: String) {
        // Removes a Room from the state with a given room_id
        let mut map = self.rooms.write().await;
        map.remove(&room_id);
    }
    pub async fn get(&self, room_id: String) -> Option<Room> {
        // Returns a clone of the Room with a given room_id
        let map = self.rooms.read().await;
        map.get(&room_id).cloned()
    }
    pub async fn get_all(&self) -> Vec<Room> {
        // Clones and returns all the Rooms in the state
        let map = self.rooms.read().await;
        map.values().cloned().collect()
    }
}
