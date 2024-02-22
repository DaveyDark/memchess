use socketioxide::extract::{Data, SocketRef};

use crate::util::{format_extension, get_data_from_extension};

pub fn on_set_name(socket: SocketRef, Data::<String>(name): Data<String>) {
    // Set username of the user
    let mut data = get_data_from_extension(&socket);
    data[0] = name;
    socket.extensions.insert(format_extension(data));
}
