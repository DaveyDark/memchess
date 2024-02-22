use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use tracing::error;

use crate::room::Room;

pub struct SocketState {
    // Main state of the app
    // Stores Room objects for each active room
    // Arc<Mutex>> ensures safe concurrent mutability and access across threads
    rooms: Arc<Mutex<HashMap<String, Room>>>,
}

impl SocketState {
    pub fn new() -> Self {
        // Returns a new empty SocketState
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    pub fn add(&self, room_id: String, room: Room) {
        // Adds a new Room to the state with a given room_id
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
        // Updates a Room in the state with a given room_id
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
        // Removes a Room from the state with a given room_id
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
        // Returns a clone of the Room with a given room_id
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
        // Clones and returns all the Rooms in the state
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
