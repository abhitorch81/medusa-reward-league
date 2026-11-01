CREATE TABLE derby_rooms (
 code TEXT PRIMARY KEY NOT NULL,
 host_hash TEXT NOT NULL,
 invite_hash TEXT NOT NULL,
 guest_hash TEXT,
 host_name TEXT NOT NULL,
 guest_name TEXT,
 state_json TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE derby_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
 room_code TEXT NOT NULL,
 action_json TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX derby_events_room_id ON derby_events(room_code,id);
