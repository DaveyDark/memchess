use socketioxide::extract::SocketRef;
use tracing::error;

pub fn get_data_from_extension(socket: &SocketRef) -> Vec<String> {
    match socket.extensions.get::<String>() {
        None => {
            error!("Expected a string in the socket extensions");
            vec!["".to_string(), "".to_string()]
        }
        Some(s) => s.split('|').map(|st| st.to_owned()).collect(),
    }
}

pub fn format_extension(data: Vec<String>) -> String {
    if data.len() != 2 {
        error!("Invalid call to format_extension");
    }
    format!("{}|{}", data[0], data[1])
}
