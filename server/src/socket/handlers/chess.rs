use std::str::FromStr;

use chess::{BoardBuilder, Piece, Square};
use socketioxide::extract::{Data, SocketRef, State};
use tracing::error;

use crate::{
    room::RoomState, socket::state::SocketState, user::User, util::get_data_from_extension,
};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Move {
    from: String,
    to: String,
    promotion: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct GameResult {
    player1: User,
    player2: User,
}

pub async fn on_move_piece(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<Move>(_move): Data<Move>,
) {
    let room_id = get_data_from_extension(&socket);
    // Get room
    let room = state.get(room_id.clone()).await;

    // Return if no room is found
    if room.is_none() {
        error!("Room {} not found", room_id);
        return;
    }
    let mut room = room.unwrap();

    // If room is inactive
    if room.get_state() != RoomState::Playing {
        if room.get_state() == RoomState::Ready {
            // Start the game if the room is ready
            room.start_game(socket.id.clone().to_string());
        } else {
            return;
        }
    }

    // Get Game Board
    let board = match room.get_chess_board() {
        Ok(board) => board,
        Err(_) => {
            // Emit Error if chess fen is illegal/corrupt
            socket
                .within(room_id)
                .emit("illegal_fen", "Fatal error")
                .unwrap_or_else(|e| error!("Failed to emit illegal_fen event: {}", e));
            return;
        }
    };

    // Parse given move
    let from = Square::from_str(&_move.from);
    let to = Square::from_str(&_move.to);
    let promotion = match _move.promotion.as_str() {
        "q" => Some(Piece::Queen),
        "r" => Some(Piece::Rook),
        "b" => Some(Piece::Bishop),
        "n" => Some(Piece::Knight),
        _ => None,
    };
    if from.is_err() || to.is_err() {
        // Emit error if move is invalid
        error!("Invalid move: {:?} in room {}", _move, room_id);
        socket
            .emit("invalid_move", "")
            .unwrap_or_else(|e| error!("Failed to emit invalid_move event: {}", e));
        return;
    }
    let from = from.unwrap();
    let to = to.unwrap();

    let chess_move = chess::ChessMove::new(from, to, promotion);

    // Check if move is legal
    if !board.legal(chess_move) {
        error!("Illegal move: {:?} in room {}", chess_move, room_id);
        socket
            .emit("illegal_move", _move)
            .unwrap_or_else(|e| error!("Failed to emit illegal_move event: {}", e));
        return;
    }

    // Check if the move is a capture
    let dest = chess_move.get_dest();
    if let Some(piece) = board.piece_on(dest) {
        // Capture
        let color = board.color_on(dest).unwrap();
        let capture = match piece.to_string(color).as_str() {
            "p" => "bp",
            "q" => "bq",
            "r" => "br",
            "b" => "bb",
            "n" => "bn",
            "k" => "bk",
            "P" => "wp",
            "Q" => "wq",
            "R" => "wr",
            "B" => "wb",
            "N" => "wn",
            "K" => "wk",
            _ => "",
        };
        // Remove corresponding piece from memory board
        let mut memory_board = room.get_memory_board();
        let removed = memory_board.remove_tiles(capture.to_string());
        room.set_memory_board(memory_board);
        socket
            .within(room_id.clone())
            .emit("remove_tiles", removed)
            .unwrap_or_else(|e| error!("Failed to emit emove_tiles event: {}", e));
    }

    // Check if move is a pawn promotion
    if promotion.is_some() {
        // Add corresponding piece to memory board
        let mut memory_board = room.get_memory_board();
        let tiles = memory_board.upgrade_tile(
            promotion.unwrap().to_string(board.side_to_move()),
            board.side_to_move(),
        );
        if let Some(t) = tiles {
            println!("{:?}", memory_board);
            room.set_memory_board(memory_board);
            socket
                .within(room_id.clone())
                .emit("upgrade_tile", t)
                .unwrap_or_else(|e| error!("Failed to emit add_tile event: {}", e));
        }
    }

    // Set the new board
    let new_board = board.make_move_new(chess_move);
    room.set_chess_board(new_board);

    // Check for game end
    if new_board.status() == chess::BoardStatus::Stalemate {
        // Stalemate
        let players = room.get_players();
        if players.0.is_none() || players.1.is_none() {
            error!("Missing player in room {}", room_id);
            return;
        }
        let result = GameResult {
            player1: players.0.unwrap(),
            player2: players.1.unwrap(),
        };
        socket
            .within(room_id.clone())
            .emit("stalemate", result)
            .unwrap_or_else(|e| error!("Failed to emit stalemate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else if new_board.status() == chess::BoardStatus::Checkmate {
        // Checkmate
        let white = room.get_white();
        let black = room.get_black();
        if white.is_none() || black.is_none() {
            error!("Missing player in room {}", room_id);
            return;
        }
        let white = white.unwrap();
        let black = black.unwrap();
        let winner = match new_board.side_to_move() {
            chess::Color::Black => GameResult {
                player1: black,
                player2: white,
            },
            chess::Color::White => GameResult {
                player1: white,
                player2: black,
            },
        };
        socket
            .within(room_id.clone())
            .emit("checkmate", winner)
            .unwrap_or_else(|e| error!("Failed to emit checkmate event: {}", e));
        room.end_game();
        state.update(room_id.clone(), room).await;
    } else {
        room.switch_turn();
        state.update(room_id.clone(), room.clone()).await;
        // Emit the move to the opponent
        socket
            .within(room_id.clone())
            .emit("piece_moved", _move)
            .unwrap_or_else(|e| error!("Failed to emit piece_moved event: {}", e));
        // Emit turn event
        let turn = room.get_turn();
        if let Some(turn) = turn {
            socket
                .within(room_id.clone())
                .emit("turn", turn)
                .unwrap_or_else(|e| error!("Failed to emit turn event: {}", e));
        }
    }
}

pub async fn on_clear_square(
    socket: SocketRef,
    state: State<SocketState>,
    Data::<String>(square): Data<String>,
) {
    let room_id = get_data_from_extension(&socket);
    // Get room
    let room = state.get(room_id.clone()).await;

    // Return if no room is found
    if room.is_none() {
        error!("Room {} not found", room_id);
        return;
    }
    let mut room = room.unwrap();

    // If room is inactive
    if room.get_state() != RoomState::Playing {
        if room.get_state() == RoomState::Ready {
            // Start the game if the room is ready
            room.start_game(socket.id.clone().to_string());
        } else {
            return;
        }
    }

    // Get Game Board
    let board = match room.get_chess_board() {
        Ok(board) => board,
        Err(_) => {
            // Emit Error if chess fen is illegal/corrupt
            socket
                .to(room_id)
                .emit("illegal_fen", "Fatal error")
                .unwrap_or_else(|e| error!("Failed to emit illegal_fen event: {}", e));
            return;
        }
    };

    // Convert to BoardBuilder
    let mut builder = BoardBuilder::from(board);

    // Remove corresponding piece from chess board
    builder.clear_square(Square::from_str(&square).unwrap());

    // Convert back to board
    let new_board: Result<chess::Board, _> = builder.try_into();
    if new_board.is_err() {
        socket
            .emit("clear_failed", "Invalid fen")
            .unwrap_or_else(|e| error!("Failed to emit clear_failed event: {}", e));
        return;
    }

    socket
        .within(room_id.clone())
        .emit("square_cleared", square)
        .unwrap_or_else(|e| error!("Failed to emit square_cleared event: {}", e));
}
