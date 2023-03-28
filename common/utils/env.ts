const PEN_WIDTH = 10;
const DEFAULT_ENLARGEMENT_RADIUS = 3;
const MAX_GAMES_PER_PAGE = 4;
const NOT_FOUND = -1;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const MILLISECOND_TO_SECONDS = 1000;
const QUARTER_SECOND = 250;
const MINUTE_TO_SECONDS = 60;
const MINUTE_LIMIT = 10;
const IMAGE_WIDTH_OFFSET = 18;
const IMAGE_HEIGHT_OFFSET = 22;
const BLINK_TIME = 100;
const NUMBER_OF_BLINKS = 3;
const BMP_FILE_HEADER_BYTES_LENGTH = 54;
const PIXEL_BYTES_LENGTH = 3;
const MIN_NBR_OF_DIFFERENCES = 3;
const MAX_NBR_OF_DIFFERENCES = 9;
const MIN_HARD_DIFFERENCES = 7;
const REQUIRED_SURFACE_PERCENTAGE = 0.15;
const WAITING_FOR_PLAYER_MESSAGE = "En attente d'un adversaire...";
const WAITING_PLAYER_ANSWER_MESSAGE = "En attente de la réponse de l'adversaire...";
const DO_YOU_WANT_TO_PLAY_WITH_MESSAGE = 'Voulez-vous jouer avec ';
const SYSTEM_MESSAGE = 'System';
const CHAT_TITLE = 'MANIA CHAT';
const VOLUME_ERROR = 0.3;
const VOLUME_SUCCESS = 1;
const ROUTE_TO_SENDING_IMAGE = '/image_processing/send-image';
const INITIAL_COUNTDOWN = 45;
const INITIAL_PENALTY = 5;
const INITIAL_BONUS = 5;
const MAX_PENALTY = 10;
const MAX_BONUS = 10;

export { INITIAL_COUNTDOWN, INITIAL_PENALTY, INITIAL_BONUS, MAX_PENALTY, MAX_BONUS };
export { CHAT_TITLE };
export { PEN_WIDTH };
export { BMP_FILE_HEADER_BYTES_LENGTH, PIXEL_BYTES_LENGTH };
export { NOT_FOUND };
export { DO_YOU_WANT_TO_PLAY_WITH_MESSAGE, WAITING_FOR_PLAYER_MESSAGE, WAITING_PLAYER_ANSWER_MESSAGE };
export { CANVAS_HEIGHT, CANVAS_WIDTH };
export { MILLISECOND_TO_SECONDS, QUARTER_SECOND, MINUTE_TO_SECONDS, MINUTE_LIMIT };
export { IMAGE_WIDTH_OFFSET, IMAGE_HEIGHT_OFFSET };
export { BLINK_TIME, NUMBER_OF_BLINKS };
export { SYSTEM_MESSAGE };
export { MIN_NBR_OF_DIFFERENCES, MAX_NBR_OF_DIFFERENCES, MIN_HARD_DIFFERENCES };
export { REQUIRED_SURFACE_PERCENTAGE, DEFAULT_ENLARGEMENT_RADIUS };
export { VOLUME_ERROR };
export { VOLUME_SUCCESS, MAX_GAMES_PER_PAGE };
export { ROUTE_TO_SENDING_IMAGE };
