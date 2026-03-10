export interface Room {
  id: string;
  name: string;
  floor: number;
  deviceIds: string[];
}

export interface Home {
  id: string;
  name: string;
  rooms: Room[];
  ownerId: string;
}
