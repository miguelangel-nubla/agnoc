import { flipObject } from "../utils/flip-object.util";

export const OPCODES = {
  COMMON_ERROR_REPLY: 0x0001,
  CLIENT_IDLE_TIMEOUT: 0x0002,
  UNK_0044: 0x0044,
  CLIENT_CMD_BEGIN: 0x07d0,
  CLIENT_ONLINE_REQ: 0x07d1,
  CLIENT_ONLINE_RSP: 0x07d2,
  CLIENT_OFFLINE_REQ: 0x07d3,
  CLIENT_OFFLINE_RSP: 0x07d4,
  CLIENT_HEARTBEAT_REQ: 0x07d5,
  CLIENT_HEARTBEAT_RSP: 0x07d6,
  CLIENT_CMD_END: 0x0833,
  USER_CMD_BEGIN: 0x0bb8,
  USER_LOGIN_RSP: 0x0bba,
  USER_LOGIN_REQ: 0x0bbb,
  USER_LOGOUT_RSP: 0x0bbc,
  USER_LOGOUT_REQ: 0x0bbd,
  USER_CHANGE_PASSWORD_RSP: 0x0bbe,
  USER_CHANGE_PASSWORD_REQ: 0x0bbf,
  USER_GET_PROFILE_RSP: 0x0bc0,
  USER_GET_PROFILE_REQ: 0x0bc1,
  USER_MODIFY_PROFILE_RSP: 0x0bc2,
  USER_MODIFY_PROFILE_REQ: 0x0bc3,
  USER_REGISTER_AUTH_RSP: 0x0bc4,
  USER_REGISTER_AUTH_REQ: 0x0bc5,
  USER_REGISTER_RSP: 0x0bc6,
  USER_REGISTER_REQ: 0x0bc7,
  USER_ADD_DEVICE_RSP: 0x0bc8,
  USER_ADD_DEVICE_REQ: 0x0bc9,
  USER_DEL_DEVICE_RSP: 0x0bca,
  USER_DEL_DEVICE_REQ: 0x0bcb,
  USER_GET_DEVICE_LIST_RSP: 0x0bcc,
  USER_GET_DEVICE_LIST_REQ: 0x0bcd,
  USER_CHECK_NAME_EXISTS_RSP: 0x0bce,
  USER_CHECK_NAME_EXISTS_REQ: 0x0bcf,
  USER_CHECK_ONLINE_RSP: 0x0bd0,
  USER_CHECK_ONLINE_REQ: 0x0bd1,
  USER_MODIFY_DEVICE_ALIAS_RSP: 0x0bd2,
  USER_MODIFY_DEVICE_ALIAS_REQ: 0x0bd3,
  USER_CHANGE_DEFAULT_DEVICE_RSP: 0x0bd4,
  USER_CHANGE_DEFAULT_DEVICE_REQ: 0x0bd5,
  USER_RESET_PASSWORD_RSP: 0x0bd6,
  USER_RESET_PASSWORD_REQ: 0x0bd7,
  USER_LOGIN_BY_AUTHCODE_RSP: 0x0bd8,
  USER_LOGIN_BY_AUTHCODE_REQ: 0x0bd9,
  USER_REQUEST_AUTHCODE_RSP: 0x0bda,
  USER_REQUEST_AUTHCODE_REQ: 0x0bdb,
  USER_DELETING_RSP: 0x0bdc,
  USER_DELETING_REQ: 0x0bdd,
  USER_GET_DEVICE_ONLINE_STATUS_RSP: 0x0bde,
  USER_GET_DEVICE_ONLINE_STATUS_REQ: 0x0bdf,
  USER_VERIFY_EMAIL_ADDRESS_RSP: 0x0be0,
  USER_VERIFY_EMAIL_ADDRESS_REQ: 0x0be1,
  USER_VERIFY_PHONE_NUMBER_RSP: 0x0be2,
  USER_VERIFY_PHONE_NUMBER_REQ: 0x0be3,
  USER_DELETE_CLEANINFO_RSP: 0x0be4,
  USER_DELETE_CLEANINFO_REQ: 0x0be5,
  USER_GET_APP_LATEST_VERSION_RSP: 0x0be6,
  USER_GET_APP_LATEST_VERSION_REQ: 0x0be7,
  USER_KICKOUT_CMD: 0x0c12,
  USER_CMD_END: 0x0c1b,
  DEVICE_CMD_BEGIN: 0x0fa0,
  DEVICE_REGISTER_REQ: 0x0fa1,
  DEVICE_REGISTER_RSP: 0x0fa2,
  DEVICE_TIME_SYNC_REQ: 0x0fa3,
  DEVICE_TIME_SYNC_RSP: 0x0fa4,
  DEVICE_SN_GETTING_REQ: 0x1005,
  DEVICE_SN_GETTING_RSP: 0x1006,
  DEVICE_INFO_GETTING_REQ: 0x1007,
  DEVICE_INFO_GETTING_RSP: 0x1008,
  DEVICE_STATUS_GETTING_REQ: 0x1009,
  DEVICE_STATUS_GETTING_RSP: 0x100a,
  DEVICE_WLAN_INFO_GETTING_REQ: 0x100b,
  DEVICE_WLAN_INFO_GETTING_RSP: 0x100c,
  DEVICE_FAULT_GETTING_REQ: 0x100d,
  DEVICE_FAULT_GETTING_RSP: 0x100e,
  DEVICE_GETTIME_REQ: 0x1011,
  DEVICE_GETTIME_RSP: 0x1012,
  DEVICE_CHARGE_REQ: 0x1069,
  DEVICE_CHARGE_RSP: 0x106a,
  DEVICE_AREA_CLEAN_REQ: 0x106b,
  DEVICE_AREA_CLEAN_RSP: 0x106c,
  DEVICE_AUTO_CLEAN_REQ: 0x106d,
  DEVICE_AUTO_CLEAN_RSP: 0x106e,
  DEVICE_MANUAL_CTRL_REQ: 0x106f,
  DEVICE_MANUAL_CTRL_RSP: 0x1070,
  DEVICE_NAVIGATE_MOVE_REQ: 0x1071,
  DEVICE_NAVIGATE_MOVE_RSP: 0x1072,
  DEVICE_POINT_CLEAN_REQ: 0x1073,
  DEVICE_POINT_CLEAN_RSP: 0x1074,
  DEVICE_CONFIG_RESET_REQ: 0x1075,
  DEVICE_CONFIG_RESET_RSP: 0x1076,
  DEVICE_WIFI_CTRL_REQ: 0x1077,
  DEVICE_WIFI_CTRL_RSP: 0x1078,
  DEVICE_CONTROL_LOCK_REQ: 0x1079,
  DEVICE_CONTROL_LOCK_RSP: 0x107a,
  DEVICE_CONTROL_UNLOCK_REQ: 0x107b,
  DEVICE_CONTROL_UNLOCK_RSP: 0x107c,
  DEVICE_WITHROOMS_CLEAN_REQ: 0x1085,
  DEVICE_WITHROOMS_CLEAN_RSP: 0x1086,
  DEVICE_AUTO_ECO_CLEAN_REQ: 0x1087,
  DEVICE_AUTO_ECO_CLEAN_RSP: 0x1088,
  DEVICE_ORDERLIST_GETTING_REQ: 0x10cd,
  DEVICE_ORDERLIST_GETTING_RSP: 0x10ce,
  DEVICE_ORDERLIST_SETTING_REQ: 0x10cf,
  DEVICE_ORDERLIST_SETTING_RSP: 0x10d0,
  DEVICE_VWALL_LIST_GETTING_REQ: 0x10d1,
  DEVICE_VWALL_LIST_GETTING_RSP: 0x10d2,
  DEVICE_VWALL_LIST_SETTING_REQ: 0x10d3,
  DEVICE_VWALL_LIST_SETTING_RSP: 0x10d4,
  DEVICE_SET_CLEAN_PREFERENCE_REQ: 0x10d9,
  DEVICE_SET_CLEAN_PREFERENCE_RSP: 0x10da,
  DEVICE_ORDERLIST_MODEFY_REQ: 0x10db,
  DEVICE_ORDERLIST_MODEFY_RSP: 0x10dc,
  DEVICE_ORDERLIST_DELETE_REQ: 0x10dd,
  DEVICE_ORDERLIST_DELETE_RSP: 0x10de,
  DEVICE_GLOBALINFO_GETTING_REQ: 0x10df,
  DEVICE_GLOBALINFO_GETTING_RSP: 0x10e0,
  DEVICE_CTRLINFO_SETTING_REQ: 0x10e1,
  DEVICE_CTRLINFO_SETTING_RSP: 0x10e2,
  DEVICE_ZERO_CALIBRATION_REQ: 0x10e7,
  DEVICE_ZERO_CALIBRATION_RSP: 0x10e8,
  DEVICE_VIRWALL_ALL_LIST_SETTING_REQ: 0x10e9,
  DEVICE_VIRWALL_ALL_LIST_SETTING_RSP: 0x10ea,
  DEVICE_SEEK_LOCATION_REQ: 0x10eb,
  DEVICE_SEEK_LOCATION_RSP: 0x10ec,
  DEVICE_AREACLEAN_INFO_GETTING_REQ: 0x10ed,
  DEVICE_AREACLEAN_INFO_GETTING_RSP: 0x10ee,
  DEVICE_ORDERLIST_SETTING_ROOMS_REQ: 0x10f7,
  DEVICE_ORDERLIST_SETTING_ROOMS_RSP: 0x10f8,
  DEVICE_ORDERLIST_GETTING_ROOMS_REQ: 0x10f9,
  DEVICE_ORDERLIST_GETTING_ROOMS_RSP: 0x10fa,
  DEVICE_MAPID_WORK_STATUS_PUSH_REQ: 0x10fe,
  DEVICE_MAPID_SET_AREA_RESTRICTED_INFO_REQ: 0x10ff,
  DEVICE_MAPID_SET_AREA_RESTRICTED_INFO_RSP: 0x1100,
  DEVICE_MAPID_SET_AREA_CLEAN_INFO_REQ: 0x1101,
  DEVICE_MAPID_SET_AREA_CLEAN_INFO_RSP: 0x1102,
  DEVICE_MAPID_SET_NAVIGATION_REQ: 0x1103,
  DEVICE_MAPID_SET_NAVIGATION_RSP: 0x1104,
  DEVICE_MAPID_SET_PLAN_PARAMS_REQ: 0x1107,
  DEVICE_MAPID_SET_PLAN_PARAMS_RSP: 0x1108,
  DEVICE_MAPID_SET_NAME_PARAMS_REQ: 0x1109,
  DEVICE_MAPID_SET_NAME_PARAMS_RSP: 0x110a,
  DEVICE_MAPID_SELECT_MAP_PLAN_REQ: 0x110b,
  DEVICE_MAPID_SELECT_MAP_PLAN_RSP: 0x110c,
  DEVICE_MAPID_GET_CONSUMABLES_PARAM_REQ: 0x1113,
  DEVICE_MAPID_GET_CONSUMABLES_PARAM_RSP: 0x1114,
  DEVICE_MAPID_SET_ARRANGEROOM_INFO_REQ: 0x1117,
  DEVICE_MAPID_SET_ARRANGEROOM_INFO_RSP: 0x1118,
  DEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_REQ: 0x111b,
  DEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_RSP: 0x111c,
  DEVICE_MAPID_SET_FORCE_REBUILD_INFO_REQ: 0x111d,
  DEVICE_MAPID_SET_FORCE_REBUILD_INFO_RSP: 0x111e,
  DEVICE_GET_ALL_GLOBAL_MAP_INFO_REQ: 0x111f,
  DEVICE_GET_ALL_GLOBAL_MAP_INFO_RSP: 0x1120,
  DEVICE_MAPID_INTO_MODEIDLE_INFO_REQ: 0x1121,
  DEVICE_MAPID_INTO_MODEIDLE_INFO_RSP: 0x1122,
  DEVICE_MAP_CTRL_REQ: 0x1131,
  DEVICE_MAP_LIDAR_CTRL_REQ: 0x1132,
  DEVICE_MAP_LIDAR_CTRL_RSP: 0x1133,
  DEVICE_MAP_LOCAL_DATA: 0x1134,
  DEVICE_MAP_PATH_DATA: 0x1135,
  DEVICE_MAP_POSITION_DATA: 0x1136,
  DEVICE_MAP_NAVIGATE_DATA: 0x1137,
  DEVICE_MAP_COVER_HISTORY: 0x1138,
  DEVICE_MAP_COVER_POSE_DATA: 0x113a,
  DEVICE_MAP_GLOBAL_DATA_REQ: 0x113b,
  DEVICE_MAP_GLOBAL_DATA_RSP: 0x113c,
  DEVICE_MAP_LOCAL_DATA_EXT: 0x113d,
  DEVICE_MAP_COVER_PATH_DATA_EXT: 0x113f,
  DEVICE_MAPID_GET_GLOBAL_INFO_REQ: 0x1162,
  DEVICE_MAPID_GET_GLOBAL_INFO_RSP: 0x1163,
  DEVICE_MAPID_PUSH_MAP_INFO: 0x1164,
  DEVICE_MAPID_PUSH_POSITION_INFO: 0x1166,
  DEVICE_MAPID_PUSH_CHARGE_POSITION_INFO: 0x1168,
  DEVICE_MAPID_PUSH_HAS_WAITING_BE_SAVED: 0x1169,
  DEVICE_MAPID_PUSH_ALL_MEMORY_MAP_INFO: 0x116a,
  DEVICE_EVENT_REPORT_BEGIN: 0x1194,
  DEVICE_EVENT_REPORT_CLEANTASK: 0x1195,
  DEVICE_EVENT_REPORT_CLEANMAP: 0x1196,
  DEVICE_EVENT_REPORT_KEY: 0x1197,
  DEVICE_EVENT_REPORT_REQ: 0x1198,
  DEVICE_EVENT_REPORT_RSP: 0x1199,
  DEVICE_WORKSTATUS_REPORT_REQ: 0x119a,
  DEVICE_WORKSTATUS_REPORT_RSP: 0x119b,
  DEVICE_VERSION_INFO_UPDATE_REQ: 0x119c,
  DEVICE_VERSION_INFO_UPDATE_RSP: 0x119d,
  DEVICE_DELETING_REQ: 0x119e,
  DEVICE_DELETING_RSP: 0x119f,
  DEVICE_CLEANMAP_BINDATA_REPORT_REQ: 0x11a0,
  DEVICE_CLEANMAP_BINDATA_REPORT_RSP: 0x11a1,
  UNK_11A4: 0x11a4,
  UNK_11A7: 0x11a7,
  DEVICE_EVENT_REPORT_END: 0x11f7,
  DEVICE_AUX_STM_DATA: 0x11f9,
  DEVICE_AUX_STATUS: 0x11fb,
  DEVICE_NETWORK_STATUS_REQ: 0x11fd,
  DEVICE_NETWORK_STATUS_RSP: 0x11fe,
  DEVICE_SOUND_STATUS_PLAY: 0x11ff,
  DEVICE_SOUND_PLAY_STATE: 0x1200,
  DEVICE_SLEEP_CTRL_REQ: 0x1201,
  DEVICE_SLEEP_CTRL_RSP: 0x1202,
  DEVICE_WAKEUP_CTRL_REQ: 0x1203,
  DEVICE_WAKEUP_CTRL_RSP: 0x1204,
  DEVICE_CTRL_VERSION_REQ: 0x1205,
  DEVICE_CTRL_VERSION_RSP: 0x1206,
  DEVICE_STM32_RESET_CTRL_REQ: 0x1207,
  DEVICE_STM32_RESET_CTRL_RSP: 0x1208,
  DEVICE_NETWORK_CTRL_RSP: 0x1209,
  DEVICE_GET_MACHINE_ID: 0x120a,
  DEVICE_SOUND_INIT: 0x120d,
  DEVICE_ENABLE_SYSTEM_SLEEP: 0x120e,
  DEVICE_NETWORK_WAKE_UP: 0x1211,
  DEVICE_MAP_CLEAR: 0x1212,
  DEVICE_CLEAN_RECORD_SEND_RESULT: 0x1214,
  DEVICE_MAP_RELOAD_GO_CHARGE: 0x1216,
  DEVICE_UPGRADE_DOWNLOAD_INFO_REQ: 0x1219,
  DEVICE_UPGRADE_DOWNLOAD_INFO_RSP: 0x121a,
  DEVICE_TEST_SERARCH_REQ: 0x121b,
  DEVICE_TEST_SERARCH_RSP: 0x121c,
  DEVICE_SYSTEM_SLEEP_STATE: 0x121f,
  DEVICE_QUIET_HOURS_STATE: 0x1227,
  DEVICE_APPEND_SET_PERFERNCE_REQ: 0x1236,
  DEVICE_APPEND_SET_PERFERNCE_RSP: 0x1237,
  DEVICE_APPEND_GET_PERFERNCE_REQ: 0x1238,
  DEVICE_APPEND_GET_PERFERNCE_RSP: 0x1239,
  DEVICE_WORK_STATUS_PUSH_NEW_REQ: 0x123f,
  DEVICE_WORK_STATUS_PUSH_NEW_RSP: 0x1240,
  DEVICE_UPGRADE_CTRL_REQ: 0x125d,
  DEVICE_UPGRADE_PACKAGE_INFO_REQ: 0x125e,
  DEVICE_UPGRADE_PACKAGE_INFO_RSP: 0x125f,
  DEVICE_UPGRADE_WORK_SUCCESS: 0x1261,
  DEVICE_SEARCH_CTRL_REQ: 0x12c1,
  DEVICE_SEARCH_CTRL_RSP: 0x12c2,
  DEVICE_OFFLINE_CMD: 0x1325,
  DEVICE_NOTCONTROL_BYUSER_CMD: 0x1326,
  USER_FORCE_UPGRADE_CHECK_REQ: 0x1327,
  USER_FORCE_UPGRADE_CHECK_RSP: 0x1328,
  DEVICE_CMD_END: 0x1387,
  QUERY_CMD_BEGIN: 0x1388,
  QUERY_DEVICE_CLEANINFO_REQ: 0x1389,
  QUERY_DEVICE_CLEANINFO_RSP: 0x138a,
  QUERY_DEVICE_CLEANMAP_REQ: 0x138b,
  QUERY_DEVICE_CLEANMAP_RSP: 0x138c,
  QUERY_DEVICE_KEY_EVENT_REQ: 0x138d,
  QUERY_DEVICE_KEY_EVENT_RSP: 0x138e,
  QUERY_DEVICE_FAULT_EVENT_REQ: 0x138f,
  QUERY_DEVICE_FAULT_EVENT_RSP: 0x1390,
  QUERY_DEVICE_CLEANMAP_BINDATA_REQ: 0x1391,
  QUERY_DEVICE_CLEANMAP_BINDATA_RSP: 0x1392,
  QUERY_CMD_END: 0x13eb,
  USER_ONLINE_STATUS_REPORT: 0x13ed,
  USER_OFFLINE_STATUS_REPORT: 0x13ee,
  DEVICE_ONLINE_STATUS_REPORT: 0x13ef,
  DEVICE_OFFLINE_STATUS_REPORT: 0x13f0,
  DEVICE_AGENT_CMD_BEGIN: 0x1450,
  USER_GET_DEVICE_ORDERLIST_REQ: 0x1451,
  USER_GET_DEVICE_ORDERLIST_RSP: 0x1452,
  USER_SET_DEVICE_ORDER_REQ: 0x1453,
  USER_SET_DEVICE_ORDER_RSP: 0x1454,
  USER_DELETE_DEVICE_ORDER_REQ: 0x1455,
  USER_DELETE_DEVICE_ORDER_RSP: 0x1456,
  USER_GET_DEVICE_CLEANPREFERENCE_REQ: 0x1457,
  USER_GET_DEVICE_CLEANPREFERENCE_RSP: 0x1458,
  USER_SET_DEVICE_CLEANPREFERENCE_REQ: 0x1459,
  USER_SET_DEVICE_CLEANPREFERENCE_RSP: 0x145a,
  USER_GET_DEVICE_CTRL_SETTING_REQ: 0x145b,
  USER_GET_DEVICE_CTRL_SETTING_RSP: 0x145c,
  USER_SET_DEVICE_CTRL_SETTING_REQ: 0x145d,
  USER_SET_DEVICE_CTRL_SETTING_RSP: 0x145e,
  PULL_DEVICE_PACKAGE_UPGRADE_INFO_REQ: 0x145f,
  PULL_DEVICE_PACKAGE_UPGRADE_INFO_RSP: 0x1460,
  PUSH_DEVICE_PACKAGE_UPGRADE_INFO_REQ: 0x1461,
  PUSH_DEVICE_PACKAGE_UPGRADE_INFO_RSP: 0x1462,
  PULL_DEVICE_AGENT_SETTING_REQ: 0x1463,
  PULL_DEVICE_AGENT_SETTING_RSP: 0x1464,
  PUSH_DEVICE_AGENT_SETTING_REQ: 0x1465,
  PUSH_DEVICE_AGENT_SETTING_RSP: 0x1466,
  USER_GET_DEVICE_QUIETHOURS_REQ: 0x146b,
  USER_GET_DEVICE_QUIETHOURS_RSP: 0x146c,
  USER_SET_DEVICE_QUIETHOURS_REQ: 0x146d,
  USER_SET_DEVICE_QUIETHOURS_RSP: 0x146e,
  PUSH_DEVICE_BATTERY_INFO_REQ: 0x146f,
  PUSH_DEVICE_BATTERY_INFO_RSP: 0x1470,
  DEVICE_AGENT_CMD_END: 0x14b3,
} as const;

export const OPNAMES = flipObject(OPCODES);
export type OPName = keyof typeof OPCODES;
