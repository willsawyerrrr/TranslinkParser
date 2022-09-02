export interface Calendar {
    service_id: string;
    monday: 0 | 1;
    tuesday: 0 | 1;
    wednesday: 0 | 1;
    thursday: 0 | 1;
    friday: 0 | 1;
    saturday: 0 | 1;
    sunday: 0 | 1;
    start_date: string;
    end_date: string;
}

export interface CalendarDates {
    service_id: string;
    date: string;
    exception_type: 1 | 2;
}

export interface Route {
    route_id: string;
    agency_id?: string;
    route_short_name?: string;
    route_long_name?: string;
    route_desc?: string;
    route_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 11 | 12;
    route_url?: string;
    route_color?: string;
    route_text_color?: string;
    route_sort_order?: number;
    continuous_pickup?: 0 | 1 | 2 | 3;
    continuous_drop_off?: 0 | 1 | 2 | 3;
    network_id?: string;
}

export interface StopTime {
    trip_id: string;
    arrival_time?: string;
    departure_time?: string;
    stop_id: string;
    stop_sequence: number;
    stop_headsign?: string;
    pickup_type?: 0 | 1 | 2 | 3;
    drop_off_type?: 0 | 1 | 2 | 3;
    continuous_pickup?: 0 | 1 | 2 | 3;
    continuous_drop_off?: 0 | 1 | 2 | 3;
    shape_dist_traveled?: number;
    timepoint?: 0 | 1;
}

export interface Stop {
    stop_id: string;
    stop_code?: string;
    stop_name?: string;
    tts_stop_name?: string;
    stop_desc?: string;
    stop_lat?: number;
    stop_lon?: number;
    zone_id?: string;
    stop_url?: string;
    location_type?: 0 | 1 | 2 | 3 | 4;
    parent_station?: string;
    stop_timezone?: string;
    wheelchair_boarding?: 0 | 1 | 2;
    level_id?: string;
    platform_code?: string;
}

export interface Trip {
    route_id: string;
    service_id: string;
    trip_id: string;
    trip_headsign?: string;
    trip_short_name?: string;
    direction_id?: 0 | 1;
    block_id?: string;
    shape_id?: string;
    wheelchair_accessible?: 0 | 1 | 2;
    bikes_allowed?: 0 | 1 | 2;
}