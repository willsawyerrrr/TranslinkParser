enum Cause {
    UNKNOWN_CAUSE,
    OTHER_CAUSE,
    TECHNICAL_PROBLEM,
    STRIKE,
    DEMONSTRATION,
    ACCIDENT,
    HOLIDAY,
    WEATHER,
    MAINTENANCE,
    CONSTRUCTION,
    POLICE_ACTIVITY,
    MEDICAL_EMERGENCY
}

enum CongestionLevel {
    UNKNOWN_CONGESTION_LEVEL,
    RUNNING_SMOOTHLY,
    STOP_AND_GO,
    CONGESTION,
    SEVERE_CONGESTION
}

enum Effect {
    NO_SERVICE,
    REDUCED_SERVICE,
    SIGNIFICANT_DELAYS,
    DETOUR,
    ADDITIONAL_SERVICE,
    MODIFIED_SERVICE,
    OTHER_EFFECT,
    UNKNOWN_EFFECT,
    STOP_MOVED,
    NO_EFFECT,
    ACCESSIBILITY_ISSUE
}

enum OccupancyStatus {
    EMPTY,
    MANY_SEATS_AVAILABLE,
    FEW_SEATS_AVAILABLE,
    STANDING_ROOM_ONLY,
    CRUSHED_STANDING_ROOM_ONLY,
    FULL,
    NOT_ACCEPTING_PASSENGERS,
    NO_DATA_AVAILABLE,
    NOT_BOARDABLE
}

enum ScheduleRelationship {
    SCHEDULED,
    SKIPPED,
    NO_DATA,
    UNSCHEDULED
}

enum SeverityLevel {
    UNKNOWN_SEVERITY,
    INFO,
    WARNING,
    SEVERE
}

enum VehicleStopStatus {
    INCOMING_AT,
    STOPPED_AT,
    IN_TRANSIT_TO
}

enum WheelchairAccessible {
    NO_VALUE,
    UNKNOWN,
    WHEELCHAIR_ACCESSIBLE,
    WHEELCHAIR_INACCESSIBLE
}

interface CarriageDetails {
    id?: string;
    label?: string;
    occupancyStatus?: OccupancyStatus;
    carriageSequence: number;
}

interface EntitySelector {
    agencyId?: string;
    routeId?: string;
    routeType?: number;
    directionId?: number;
    trip?: TripDescriptor;
    stopId?: string;
}

interface LocalizedImage {
    url: string;
    mediaType: string;
    language?: string;
}

interface Position {
    latitude: number;
    longitude: number;
    bearing?: number;
    odometer?: number;
    speed?: number;
}

interface StopTimeEvent {
    delay?: number;
    time?: string;
    uncertainty?: number;
}

interface StopTimeProperties {
    assignedStopId?: string;
}

interface StopTimeUpdate {
    stopSequence?: number;
    stopId?: string;
    arrival?: StopTimeEvent;
    departure?: StopTimeEvent;
    departureOccupancyStatus?: OccupancyStatus;
    scheduleRelationship?: ScheduleRelationship;
    stopTimeProperties?: StopTimeProperties;
}

interface TimeRange {
    start?: number;
    end?: number;
}

interface TranslatedImage {
    localizedImage: LocalizedImage[];
}

interface TranslatedString {
    translation: Translation[];
}

interface Translation {
    text: string;
    language?: string;
}

interface TripProperties {
    tripId?: string;
    startDate?: string;
    startTime?: string;
    shapeId?: string;
}

interface TripDescriptor {
    tripId?: string;
    routeId?: string;
    directionId?: number;
    startTime?: string;
    startDate?: string;
    scheduleRelationship?: ScheduleRelationship;
}

interface VehicleDescriptor {
    id?: string;
    label?: string
    licencePlate?: string;
    wheelchairAccessible?: WheelchairAccessible;
}

export interface Alert {
    activePeriod?: TimeRange[];
    informedEntity: EntitySelector[];
    cause?: Cause;
    causeDetail?: TranslatedString;
    effect?: Effect;
    effectDetail?: TranslatedString;
    url?: TranslatedString;
    headerText: TranslatedString;
    descriptionText: TranslatedString;
    ttsHeaderText?: TranslatedString;
    ttsDescriptionText?: TranslatedString;
    severityLevel?: SeverityLevel;
    image?: TranslatedImage;
    imageAlternativeText?: TranslatedString;
}

export interface TripUpdate {
    trip: TripDescriptor;
    vehicle?: VehicleDescriptor;
    stopTimeUpdate?: StopTimeUpdate[];
    timestamp?: number;
    delay?: number;
    tripProperties?: TripProperties;
}

export interface VehiclePosition {
    trip?: TripDescriptor;
    vehicle?: VehicleDescriptor;
    position?: Position;
    currentStopSequence?: number;
    stopId?: string;
    currentStatus?: VehicleStopStatus;
    timestamp?: number;
    congestionLevel?: CongestionLevel;
    occupancyStatus?: OccupancyStatus;
    occupancyPercentage?: number;
    multiCarriageDetails?: CarriageDetails[];
}
