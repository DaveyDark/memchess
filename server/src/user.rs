use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    id: String,
    name: String,
    avatar: String,
    avatar_orientation: String,
    avatar_color: String,
    chess_color: String,
}

impl User {
    pub fn new(
        id: String,
        name: String,
        avatar: String,
        avatar_orientation: String,
        avatar_color: String,
        chess_color: String,
    ) -> Self {
        Self {
            id,
            name,
            avatar,
            avatar_orientation,
            avatar_color,
            chess_color,
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
    pub fn get_name(&self) -> String {
        self.name.clone()
    }
}
