/* eslint-disable @typescript-eslint/unbound-method */
import { OPName } from "../constants/opcodes.constant";
import { bind } from "../decorators/bind.decorator";
import { Connection } from "./connection.emitter";
import { Multiplexer } from "./multiplexer.emitter";
import { Message } from "../value-objects/message.value-object";
import { Packet } from "../value-objects/packet.value-object";
import { Device } from "../entities/device.entity";
import { User } from "../entities/user.entity";
import { debug } from "../utils/debug.util";
import {
  DeviceSystemProps,
  DEVICE_MODEL,
} from "../value-objects/device-system.value-object";
import {
  ICOMMON_ERROR_REPLY,
  IDEVICE_AREA_CLEAN_REQ,
  IDEVICE_AUTO_CLEAN_REQ,
  IDEVICE_CHARGE_REQ,
  IDEVICE_CLEANMAP_BINDATA_REPORT_REQ,
  IDEVICE_CLEANMAP_BINDATA_REPORT_RSP,
  IDEVICE_EVENT_REPORT_CLEANMAP,
  IDEVICE_EVENT_REPORT_RSP,
  IDEVICE_GETTIME_RSP,
  IDEVICE_GET_ALL_GLOBAL_MAP_INFO_REQ,
  IDEVICE_MANUAL_CTRL_REQ,
  IDEVICE_MAPID_GET_CONSUMABLES_PARAM_RSP,
  IDEVICE_MAPID_GET_GLOBAL_INFO_REQ,
  IDEVICE_MAPID_SET_AREA_CLEAN_INFO_REQ,
  IDEVICE_MAPID_SET_AREA_RESTRICTED_INFO_REQ,
  IDEVICE_MAPID_SET_CONSUMABLES_PARAM_REQ,
  IDEVICE_MAPID_SET_NAVIGATION_REQ,
  IDEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_REQ,
  IDEVICE_MAPID_WORK_STATUS_PUSH_REQ,
  IDEVICE_ORDERLIST_DELETE_REQ,
  IDEVICE_ORDERLIST_GETTING_RSP,
  IDEVICE_SET_CLEAN_PREFERENCE_REQ,
  IDEVICE_VERSION_INFO_UPDATE_REQ,
  IDEVICE_VERSION_INFO_UPDATE_RSP,
  IDEVICE_WITHROOMS_CLEAN_REQ,
  IDEVICE_WLAN_INFO_GETTING_REQ,
  IDEVICE_WLAN_INFO_GETTING_RSP,
  IDEVICE_WORKSTATUS_REPORT_RSP,
  IPUSH_DEVICE_AGENT_SETTING_REQ,
  IPUSH_DEVICE_AGENT_SETTING_RSP,
  IPUSH_DEVICE_BATTERY_INFO_REQ,
  IPUSH_DEVICE_BATTERY_INFO_RSP,
  IPUSH_DEVICE_PACKAGE_UPGRADE_INFO_RSP,
  IUNK_0044,
  IUNK_11A7,
  IUSER_GET_DEVICE_QUIETHOURS_RSP,
  IUSER_SET_DEVICE_CLEANPREFERENCE_REQ,
  IUSER_SET_DEVICE_QUIETHOURS_REQ,
} from "../../schemas/schema";
import { hasKey } from "../utils/has-key.util";
import {
  DeviceStatus,
  DeviceStatusProps,
  DEVICE_MODE,
  FanSpeed,
  FAN_SPEED,
} from "../value-objects/device-status.value-object";
import { TypedEmitter } from "tiny-typed-emitter";
import { Debugger } from "debug";
import { DeviceOrder } from "../entities/device-order.entity";
import {
  ConsumableType,
  CONSUMABLE_TYPE,
  DeviceConsumable,
} from "../value-objects/device-consumable.value-object";
import {
  ChargePoseInfo,
  MapInfo,
  RobotPoseInfo,
} from "../interfaces/map.interface";
import { DeviceMapProps } from "../entities/device-map.entity";
import { Coordinate } from "../value-objects/coordinate.value-object";
import { Position } from "../value-objects/position.value-object";
import { ID } from "../value-objects/id.value-object";
import { DomainException } from "../exceptions/domain.exception";
import { Room } from "../entities/room.entity";
import { isPresent } from "../utils/is-present.util";
import { DeviceWlan } from "../value-objects/device-wlan.value-object";
import { Zone } from "../entities/zone.entity";
import { waitFor } from "../utils/wait-for.util";
import { ArgumentInvalidException } from "../exceptions/argument-invalid.exception";
import { DeviceConfigProps } from "../value-objects/device-config.value-object";
import { DeviceQuietHours } from "../value-objects/device-quiet-hours.value-object";
import { DeviceTime } from "../value-objects/device-time.value-object";

export interface RobotProps {
  device: Device;
  user: User;
  multiplexer: Multiplexer;
}

interface DeviceTimestamp {
  timestamp: number;
  offset: number;
}

type Handler = (message: Message) => void;
type Handlers = Partial<Record<OPName, Handler>>;

interface RobotEvents {
  updateDevice: () => void;
  updateMap: () => void;
}

export enum MANUAL_MODE {
  "forward" = 1,
  "left" = 2,
  "right" = 3,
  "backward" = 4,
  "stop" = 5,
  "init" = 10,
}

export type ManualMode = typeof MANUAL_MODE[keyof typeof MANUAL_MODE];

const MODE_CHANGE_TIMEOUT = 5000;

const CONSUMABLE_TYPE_RESET = {
  [CONSUMABLE_TYPE.MAIN_BRUSH]: 1,
  [CONSUMABLE_TYPE.SIDE_BRUSH]: 2,
  [CONSUMABLE_TYPE.FILTER]: 3,
  [CONSUMABLE_TYPE.DISHCLOTH]: 4,
};

export class Robot extends TypedEmitter<RobotEvents> {
  public readonly device: Device;
  public readonly user: User;
  private readonly multiplexer: Multiplexer;
  private debug: Debugger;
  private handlers: Handlers = {
    CLIENT_HEARTBEAT_REQ: this.handleClientHeartbeat,
    DEVICE_MAPID_GET_GLOBAL_INFO_RSP: this.handleMapUpdate,
    DEVICE_MAPID_PUSH_CHARGE_POSITION_INFO: this.handleUpdateChargePosition,
    DEVICE_MAPID_PUSH_MAP_INFO: this.handleMapUpdate,
    DEVICE_MAPID_PUSH_POSITION_INFO: this.handleUpdateRobotPosition,
    DEVICE_MAPID_WORK_STATUS_PUSH_REQ: this.handleDeviceStatus,
    DEVICE_VERSION_INFO_UPDATE_REQ: this.handleDeviceVersionInfoUpdate,
    PUSH_DEVICE_AGENT_SETTING_REQ: this.handleDeviceAgentSetting,
    PUSH_DEVICE_BATTERY_INFO_REQ: this.handleDeviceBatteryInfo,
    PUSH_DEVICE_PACKAGE_UPGRADE_INFO_REQ: this.handleDevicePackageUpgrade,
    DEVICE_MAPID_PUSH_HAS_WAITING_BE_SAVED: this.handleWaitingMap,
    DEVICE_WORKSTATUS_REPORT_REQ: this.handleWorkstatusReport,
    DEVICE_EVENT_REPORT_CLEANTASK: this.handleReportCleantask,
    DEVICE_EVENT_REPORT_CLEANMAP: this.handleReportCleanmap,
    DEVICE_CLEANMAP_BINDATA_REPORT_REQ: this.handleBinDataReport,
    DEVICE_EVENT_REPORT_REQ: this.handleEventReport,
  };

  constructor({ device, user, multiplexer }: RobotProps) {
    super();
    this.device = device;
    this.user = user;
    this.multiplexer = multiplexer;
    this.debug = debug(__filename).extend(this.device.id.toString());
    this.debug("new robot");
  }

  get isConnected(): boolean {
    return this.multiplexer.hasConnections;
  }

  async start(): Promise<void> {
    if (this.device.status?.mode === DEVICE_MODE.ZONE) {
      await this.sendRecv("DEVICE_AREA_CLEAN_REQ", "DEVICE_AREA_CLEAN_RSP", {
        ctrlValue: 1,
      } as IDEVICE_AREA_CLEAN_REQ);
    } else if (
      this.device.status?.mode === DEVICE_MODE.SPOT &&
      this.device.map?.currentSpot
    ) {
      await this.sendRecv(
        "DEVICE_MAPID_SET_NAVIGATION_REQ",
        "DEVICE_MAPID_SET_NAVIGATION_RSP",
        {
          mapHeadId: this.device.map.id.value,
          poseX: this.device.map.currentSpot.x,
          poseY: this.device.map.currentSpot.y,
          posePhi: this.device.map.currentSpot.phi,
          ctrlValue: 1,
        } as IDEVICE_MAPID_SET_NAVIGATION_REQ
      );
    } else {
      await this.sendRecv("DEVICE_AUTO_CLEAN_REQ", "DEVICE_AUTO_CLEAN_RSP", {
        ctrlValue: 1,
        cleanType: 2,
      } as IDEVICE_AUTO_CLEAN_REQ);
    }
  }

  async stop(): Promise<void> {
    if (this.device.status?.mode === DEVICE_MODE.ZONE) {
      await this.sendRecv("DEVICE_AREA_CLEAN_REQ", "DEVICE_AREA_CLEAN_RSP", {
        ctrlValue: 2,
      } as IDEVICE_AREA_CLEAN_REQ);
    } else if (
      this.device.status?.mode === DEVICE_MODE.SPOT &&
      this.device.map?.currentSpot
    ) {
      await this.sendRecv(
        "DEVICE_MAPID_SET_NAVIGATION_REQ",
        "DEVICE_MAPID_SET_NAVIGATION_RSP",
        {
          mapHeadId: this.device.map.id.value,
          poseX: this.device.map.currentSpot.x,
          poseY: this.device.map.currentSpot.y,
          posePhi: this.device.map.currentSpot.phi,
          ctrlValue: 2,
        } as IDEVICE_MAPID_SET_NAVIGATION_REQ
      );
    } else {
      await this.sendRecv("DEVICE_AUTO_CLEAN_REQ", "DEVICE_AUTO_CLEAN_RSP", {
        ctrlValue: 2,
        cleanType: 2,
      } as IDEVICE_AUTO_CLEAN_REQ);
    }
  }

  async home(): Promise<void> {
    await this.sendRecv("DEVICE_CHARGE_REQ", "DEVICE_CHARGE_RSP", {
      enable: 1,
    } as IDEVICE_CHARGE_REQ);
  }

  async locate(): Promise<void> {
    await this.sendRecv("DEVICE_SEEK_LOCATION_REQ", "DEVICE_SEEK_LOCATION_RSP");
  }

  async setFanSpeed(speed: FanSpeed): Promise<void> {
    if (hasKey(FAN_SPEED, speed)) {
      await this.sendRecv(
        "DEVICE_SET_CLEAN_PREFERENCE_REQ",
        "DEVICE_SET_CLEAN_PREFERENCE_RSP",
        // eslint-disable-next-line security/detect-object-injection
        { mode: FAN_SPEED[speed] } as IDEVICE_SET_CLEAN_PREFERENCE_REQ
      );
    } else {
      throw new Error("Invalid fan speed");
    }
  }

  async getTime(): Promise<DeviceTimestamp> {
    const packet = await this.sendRecv(
      "DEVICE_GETTIME_REQ",
      "DEVICE_GETTIME_RSP"
    );
    const object = packet.payload.object as IDEVICE_GETTIME_RSP;

    return {
      timestamp: object.body.deviceTime * 1000,
      offset: object.body.deviceTimezone,
    };
  }

  async getConsumables(): Promise<DeviceConsumable[]> {
    const packet = await this.sendRecv(
      "DEVICE_MAPID_GET_CONSUMABLES_PARAM_REQ",
      "DEVICE_MAPID_GET_CONSUMABLES_PARAM_RSP"
    );
    const object = packet.payload
      .object as IDEVICE_MAPID_GET_CONSUMABLES_PARAM_RSP;
    const consumables = [
      new DeviceConsumable({
        type: CONSUMABLE_TYPE.MAIN_BRUSH,
        used: object.mainBrushTime,
      }),
      new DeviceConsumable({
        type: CONSUMABLE_TYPE.SIDE_BRUSH,
        used: object.sideBrushTime,
      }),
      new DeviceConsumable({
        type: CONSUMABLE_TYPE.FILTER,
        used: object.filterTime,
      }),
      new DeviceConsumable({
        type: CONSUMABLE_TYPE.DISHCLOTH,
        used: object.dishclothTime,
      }),
    ];

    this.device.updateConsumables(consumables);

    return consumables;
  }

  async resetConsumable(consumable: ConsumableType): Promise<void> {
    if (!(consumable in CONSUMABLE_TYPE_RESET)) {
      throw new ArgumentInvalidException("Invalid consumable");
    }

    // eslint-disable-next-line security/detect-object-injection
    const itemId = CONSUMABLE_TYPE_RESET[consumable];

    await this.sendRecv(
      "DEVICE_MAPID_SET_CONSUMABLES_PARAM_REQ",
      "DEVICE_MAPID_SET_CONSUMABLES_PARAM_RSP",
      { itemId } as IDEVICE_MAPID_SET_CONSUMABLES_PARAM_REQ
    );
  }

  async updateMap(): Promise<void> {
    let mask = 0x78ff;

    if (this.device.system.model === DEVICE_MODEL.C3090) {
      mask = 0xff;
    }

    await this.sendRecv(
      "DEVICE_MAPID_GET_GLOBAL_INFO_REQ",
      "DEVICE_MAPID_GET_GLOBAL_INFO_RSP",
      { mask } as IDEVICE_MAPID_GET_GLOBAL_INFO_REQ
    );
  }

  async getWlan(): Promise<DeviceWlan> {
    const packet = await this.sendRecv(
      "DEVICE_WLAN_INFO_GETTING_REQ",
      "DEVICE_WLAN_INFO_GETTING_RSP",
      {} as IDEVICE_WLAN_INFO_GETTING_REQ
    );
    const object = packet.payload.object as IDEVICE_WLAN_INFO_GETTING_RSP;

    this.device.updateWlan(object.body);
    this.emit("updateDevice");

    return this.device.wlan as DeviceWlan;
  }

  async enterManualMode(): Promise<void> {
    await this.sendRecv("DEVICE_AUTO_CLEAN_REQ", "DEVICE_AUTO_CLEAN_RSP", {
      ctrlValue: 0,
      cleanType: 2,
    } as IDEVICE_AUTO_CLEAN_REQ);
    await this.sendRecv("DEVICE_MANUAL_CTRL_REQ", "DEVICE_MANUAL_CTRL_RSP", {
      command: MANUAL_MODE.init,
    } as IDEVICE_MANUAL_CTRL_REQ);
  }

  async leaveManualMode(): Promise<void> {
    await this.sendRecv("DEVICE_AUTO_CLEAN_REQ", "DEVICE_AUTO_CLEAN_RSP", {
      ctrlValue: 2,
      cleanType: 2,
    } as IDEVICE_AUTO_CLEAN_REQ);
  }

  async setManualMode(command: ManualMode): Promise<void> {
    await this.sendRecv("DEVICE_MANUAL_CTRL_REQ", "DEVICE_MANUAL_CTRL_RSP", {
      command,
    } as IDEVICE_MANUAL_CTRL_REQ);
  }

  async getOrders(): Promise<DeviceOrder[]> {
    const packet = await this.sendRecv(
      "DEVICE_ORDERLIST_GETTING_REQ",
      "DEVICE_ORDERLIST_GETTING_RSP"
    );
    const object = packet.payload.object as IDEVICE_ORDERLIST_GETTING_RSP;
    const orders = object.orderList?.map(DeviceOrder.fromOrderList) || [];

    this.device.updateOrders(orders);

    return orders;
  }

  async setOrder(order: DeviceOrder): Promise<void> {
    const orderList = order.toOrderList();

    await this.sendRecv(
      "DEVICE_ORDERLIST_SETTING_REQ",
      "DEVICE_ORDERLIST_SETTING_RSP",
      orderList
    );
  }

  async deleteOrder(order: DeviceOrder): Promise<void> {
    await this.sendRecv(
      "DEVICE_ORDERLIST_SETTING_REQ",
      "DEVICE_ORDERLIST_SETTING_RSP",
      { orderId: order.id.value, mode: 1 } as IDEVICE_ORDERLIST_DELETE_REQ
    );
  }

  async cleanPosition(position: Position): Promise<void> {
    if (!this.device.map) {
      throw new DomainException("Unable to set robot position: map not loaded");
    }

    if (this.device.status?.mode !== DEVICE_MODE.SPOT) {
      let mask = 0x78ff | 0x200;

      if (this.device.system.model === DEVICE_MODEL.C3090) {
        mask = 0xff | 0x200;
      }

      await this.sendRecv(
        "DEVICE_MAPID_GET_GLOBAL_INFO_REQ",
        "DEVICE_MAPID_GET_GLOBAL_INFO_RSP",
        { mask } as IDEVICE_MAPID_GET_GLOBAL_INFO_REQ
      );

      await waitFor(() => this.device.status?.mode === DEVICE_MODE.SPOT, {
        timeout: MODE_CHANGE_TIMEOUT,
      }).catch(() => {
        throw new DomainException("Unable to change robot to position mode");
      });
    }

    await this.sendRecv(
      "DEVICE_MAPID_SET_NAVIGATION_REQ",
      "DEVICE_MAPID_SET_NAVIGATION_RSP",
      {
        mapHeadId: this.device.map.id.value,
        poseX: position.x,
        poseY: position.y,
        posePhi: position.phi,
        ctrlValue: 1,
      } as IDEVICE_MAPID_SET_NAVIGATION_REQ
    );
  }

  /**
   * A ┌───┐ D
   *   │   │
   * B └───┘ C
   */
  async cleanAreas(areas: Coordinate[][]): Promise<void> {
    if (!this.device.map) {
      return;
    }

    if (this.device.status?.mode !== DEVICE_MODE.ZONE) {
      await this.sendRecv("DEVICE_AREA_CLEAN_REQ", "DEVICE_AREA_CLEAN_RSP", {
        ctrlValue: 0,
      } as IDEVICE_AREA_CLEAN_REQ);

      let mask = 0x78ff | 0x100;

      if (this.device.system.model === DEVICE_MODEL.C3090) {
        mask = 0xff | 0x100;
      }

      await this.sendRecv(
        "DEVICE_MAPID_GET_GLOBAL_INFO_REQ",
        "DEVICE_MAPID_GET_GLOBAL_INFO_RSP",
        { mask } as IDEVICE_MAPID_GET_GLOBAL_INFO_REQ
      );

      await waitFor(() => this.device.status?.mode === DEVICE_MODE.ZONE, {
        timeout: MODE_CHANGE_TIMEOUT,
      }).catch(() => {
        throw new DomainException("Unable to change robot to area mode");
      });
    }

    const req: IDEVICE_MAPID_SET_AREA_CLEAN_INFO_REQ = {
      mapHeadId: this.device.map.id.value,
      unk1: 0,
      cleanAreaLength: areas.length,
      cleanAreaList: areas.map((coords) => {
        return {
          cleanAreaId: ID.generate().value,
          unk1: 0,
          coordinateLength: coords.length,
          coordinateList: coords,
        };
      }),
    };

    await this.sendRecv(
      "DEVICE_MAPID_SET_AREA_CLEAN_INFO_REQ",
      "DEVICE_MAPID_SET_AREA_CLEAN_INFO_RSP",
      req
    );
    await this.sendRecv("DEVICE_AREA_CLEAN_REQ", "DEVICE_AREA_CLEAN_RSP", {
      ctrlValue: 1,
    } as IDEVICE_AREA_CLEAN_REQ);
  }

  /**
   * A ┌───┐ D
   *   │   │
   * B └───┘ C
   */
  async setRestrictedZones(areas: Coordinate[][]): Promise<void> {
    if (!this.device.map) {
      return;
    }

    if (!areas.length) {
      areas.push([]);
    }

    await this.sendRecv(
      "DEVICE_MAPID_SET_AREA_RESTRICTED_INFO_REQ",
      "DEVICE_MAPID_SET_AREA_RESTRICTED_INFO_RSP",
      {
        mapHeadId: this.device.map.id.value,
        unk1: 0,
        cleanAreaLength: areas.length,
        cleanAreaList: areas.map((coords) => {
          return {
            cleanAreaId: ID.generate().value,
            unk1: 0,
            coordinateLength: coords.length,
            coordinateList: coords,
          };
        }),
      } as IDEVICE_MAPID_SET_AREA_RESTRICTED_INFO_REQ
    );
  }

  async getQuietHours(): Promise<DeviceQuietHours> {
    const packet = await this.sendRecv(
      "USER_GET_DEVICE_QUIETHOURS_REQ",
      "USER_GET_DEVICE_QUIETHOURS_RSP"
    );
    const object = packet.payload.object as IUSER_GET_DEVICE_QUIETHOURS_RSP;
    const quietHours = new DeviceQuietHours({
      isEnabled: object.isOpen,
      begin: DeviceTime.fromMinutes(object.beginTime),
      end: DeviceTime.fromMinutes(object.endTime),
    });

    this.device.config?.updateQuietHours(quietHours);

    return quietHours;
  }

  async setQuietHours(quietHours: DeviceQuietHours): Promise<void> {
    await this.sendRecv(
      "USER_SET_DEVICE_QUIETHOURS_REQ",
      "USER_SET_DEVICE_QUIETHOURS_RSP",
      {
        isOpen: quietHours.isEnabled,
        beginTime: quietHours.begin.toMinutes(),
        endTime: quietHours.end.toMinutes(),
      } as IUSER_SET_DEVICE_QUIETHOURS_REQ
    );
  }

  async setCarpetMode(enable: boolean): Promise<void> {
    await this.sendRecv(
      "USER_SET_DEVICE_CLEANPREFERENCE_REQ",
      "USER_SET_DEVICE_CLEANPREFERENCE_RSP",
      {
        carpetTurbo: enable,
      } as IUSER_SET_DEVICE_CLEANPREFERENCE_REQ
    );

    this.device.config?.updateCarpetMode(enable);
  }

  async discardWaitingMap(): Promise<void> {
    await this.sendRecv(
      "DEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_REQ",
      "DEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_RSP",
      { mode: 0 } as IDEVICE_MAPID_SET_SAVEWAITINGMAP_INFO_REQ
    );
  }

  async cleanRooms(rooms: Room[]): Promise<void> {
    const ids = rooms.map((room) => room.id.value);

    await this.sendRecv(
      "DEVICE_WITHROOMS_CLEAN_REQ",
      "DEVICE_WITHROOMS_CLEAN_RSP",
      {
        ctrlValue: 1,
        cleanType: 2,
        roomNumber: ids.length,
        roomIdList: Buffer.from(ids),
      } as IDEVICE_WITHROOMS_CLEAN_REQ
    );
  }

  async controlLock(): Promise<void> {
    await this.sendRecv("DEVICE_CONTROL_LOCK_REQ", "DEVICE_CONTROL_LOCK_RSP");
  }

  async handshake(): Promise<void> {
    await this.controlLock();

    this.send("DEVICE_STATUS_GETTING_REQ");

    void this.send("DEVICE_GET_ALL_GLOBAL_MAP_INFO_REQ", {
      unk1: 0,
      unk2: "",
    } as IDEVICE_GET_ALL_GLOBAL_MAP_INFO_REQ);

    void this.getTime();
    void this.updateMap();
    void this.getOrders();
    void this.getConsumables();
    void this.getWlan();
  }

  @bind
  handleDeviceVersionInfoUpdate(message: Message): void {
    const props = message.packet.payload
      .object as IDEVICE_VERSION_INFO_UPDATE_REQ;

    this.device.updateSystem(props as DeviceSystemProps);
    this.emit("updateDevice");

    message.respond("DEVICE_VERSION_INFO_UPDATE_RSP", {
      result: 0,
    } as IDEVICE_VERSION_INFO_UPDATE_RSP);
  }

  @bind
  handleDeviceAgentSetting(message: Message): void {
    const object = message.packet.payload
      .object as IPUSH_DEVICE_AGENT_SETTING_REQ;
    const props: DeviceConfigProps = {
      voice: {
        isEnabled: object.voice.voiceMode,
        volume: object.voice.volume || 0,
      },
      quietHours: new DeviceQuietHours({
        isEnabled: object.quietHours.isOpen,
        begin: DeviceTime.fromMinutes(object.quietHours.beginTime),
        end: DeviceTime.fromMinutes(object.quietHours.endTime),
      }),
      isEcoModeEnabled: object.cleanPreference.ecoMode || false,
      isRepeatCleanEnabled: object.cleanPreference.repeatClean || false,
      isBrokenCleanEnabled: object.cleanPreference.cleanBroken || false,
      isCarpetModeEnabled: object.cleanPreference.carpetTurbo || false,
      isHistoryMapEnabled: object.cleanPreference.historyMap || false,
    };

    this.device.updateConfig(props);

    message.respond("PUSH_DEVICE_AGENT_SETTING_RSP", {
      result: 0,
    } as IPUSH_DEVICE_AGENT_SETTING_RSP);
  }

  @bind
  handleClientHeartbeat(message: Message): void {
    message.respond("CLIENT_HEARTBEAT_RSP");
  }

  @bind
  handleDevicePackageUpgrade(message: Message): void {
    message.respond("PUSH_DEVICE_PACKAGE_UPGRADE_INFO_RSP", {
      result: 0,
    } as IPUSH_DEVICE_PACKAGE_UPGRADE_INFO_RSP);
  }

  @bind
  handleDeviceStatus(message: Message): void {
    const object = message.packet.payload
      .object as IDEVICE_MAPID_WORK_STATUS_PUSH_REQ;
    const {
      battery,
      type,
      workMode,
      chargeStatus,
      cleanPreference,
      faultCode,
    } = object;
    const props: DeviceStatusProps = {
      battery: DeviceStatus.getBatteryValue({ battery }),
      state: DeviceStatus.getStateValue({
        type,
        workMode,
        chargeStatus,
      }),
      mode: DeviceStatus.getModeValue({ workMode }),
      fanSpeed: DeviceStatus.getFanSpeedValue({ cleanPreference }),
      currentCleanSize: object.cleanSize,
      currentCleanTime: object.cleanTime,
      error: DeviceStatus.getError({ faultCode }),
    };

    this.device.updateStatus(props);
    this.emit("updateDevice");
  }

  @bind
  handleMapUpdate(message: Message): void {
    const object = message.packet.payload.object as MapInfo;
    const {
      statusInfo,
      mapHeadInfo,
      mapGrid,
      robotPoseInfo,
      robotChargeInfo,
      cleanRoomList,
      roomSegmentList,
      wallListInfo,
      spotInfo,
    } = object;
    const props: Partial<DeviceMapProps> = {
      rooms: [],
      restrictedZones: [],
    };

    if (statusInfo) {
      const {
        batteryPercent: battery,
        faultType: type,
        workingMode: workMode,
        chargeState: chargeStatus,
        cleanPreference,
      } = statusInfo;

      this.device.updateStatus({
        battery: DeviceStatus.getBatteryValue({ battery }),
        state: DeviceStatus.getStateValue({
          type,
          workMode,
          chargeStatus,
        }),
        mode: DeviceStatus.getModeValue({ workMode }),
        fanSpeed: DeviceStatus.getFanSpeedValue({ cleanPreference }),
        currentCleanSize: statusInfo.cleanSize,
        currentCleanTime: statusInfo.cleanTime,
      });
      this.emit("updateDevice");
    }

    if (mapHeadInfo) {
      Object.assign(props, {
        id: new ID(mapHeadInfo.mapHeadId),
        size: new Coordinate({
          x: mapHeadInfo.sizeX,
          y: mapHeadInfo.sizeY,
        }),
        min: new Coordinate({
          x: mapHeadInfo.minX,
          y: mapHeadInfo.minY,
        }),
        max: new Coordinate({
          x: mapHeadInfo.maxX,
          y: mapHeadInfo.maxY,
        }),
      });
    }

    if (mapGrid) {
      props.grid = mapGrid;
    }

    if (robotPoseInfo) {
      props.robot = new Position({
        x: robotPoseInfo.poseX,
        y: robotPoseInfo.poseY,
        phi: robotPoseInfo.posePhi,
      });
    }

    if (robotChargeInfo) {
      props.charger = new Position({
        x: robotChargeInfo.poseX,
        y: robotChargeInfo.poseY,
        phi: robotChargeInfo.posePhi,
      });
    }

    if (spotInfo) {
      props.currentSpot = new Position({
        x: spotInfo.poseX,
        y: spotInfo.poseY,
        phi: spotInfo.posePhi,
      });
    }

    if (wallListInfo) {
      props.restrictedZones = wallListInfo.cleanAreaList.map((cleanArea) => {
        return new Zone({
          id: new ID(cleanArea.cleanAreaId),
          coordinates: cleanArea.coordinateList.map(({ x, y }) => {
            return new Coordinate({
              x,
              y,
            });
          }),
        });
      });
    }

    if (cleanRoomList && roomSegmentList) {
      props.rooms = cleanRoomList
        .map((cleanRoom) => {
          const segment = roomSegmentList.find(
            (roomSegment) => roomSegment.roomId === cleanRoom.roomId
          );

          if (!segment) {
            return undefined;
          }

          return new Room({
            id: new ID(cleanRoom.roomId),
            name: cleanRoom.roomName,
            center: new Coordinate({
              x: cleanRoom.roomX,
              y: cleanRoom.roomY,
            }),
            pixels: segment?.roomPixelList.map((pixel) => {
              return new Coordinate({
                x: pixel.x,
                y: pixel.y,
              });
            }),
          });
        })
        .filter(isPresent);
    }

    this.device.updateMap(props as DeviceMapProps);
    this.emit("updateMap");
  }

  @bind
  handleUpdateRobotPosition(message: Message): void {
    if (!this.device.map) {
      return;
    }

    const object = message.packet.payload.object as RobotPoseInfo;

    this.device.map.updateRobot(
      new Position({
        x: object.poseX,
        y: object.poseY,
        phi: object.posePhi,
      })
    );
    this.emit("updateMap");
  }

  @bind
  handleUpdateChargePosition(message: Message): void {
    if (!this.device.map) {
      return;
    }

    const object = message.packet.payload.object as ChargePoseInfo;

    this.device.map.updateCharger(
      new Position({
        x: object.poseX,
        y: object.poseY,
        phi: object.posePhi,
      })
    );
    this.emit("updateMap");
  }

  @bind
  handleDeviceBatteryInfo(message: Message): void {
    message.respond("PUSH_DEVICE_BATTERY_INFO_RSP", {
      result: 0,
    } as IPUSH_DEVICE_BATTERY_INFO_RSP);

    // TODO: fix this.
    if (!this.device.status) {
      return;
    }

    const object = message.packet.payload
      .object as IPUSH_DEVICE_BATTERY_INFO_REQ;
    const battery = object.battery.level;
    const props: Partial<DeviceStatusProps> = {
      battery: DeviceStatus.getBatteryValue({ battery }),
    };

    this.device.updateStatus(props);
    this.emit("updateDevice");
  }

  @bind
  handleWaitingMap(): void {
    // Discard waiting map for now.
    void this.discardWaitingMap();
  }

  @bind
  handleWorkstatusReport(message: Message): void {
    message.respond("DEVICE_WORKSTATUS_REPORT_RSP", {
      result: 0,
    } as IDEVICE_WORKSTATUS_REPORT_RSP);
  }

  @bind
  handleReportCleantask(message: Message): void {
    message.respond("UNK_11A4", { unk1: 0 } as IUNK_0044);
  }

  @bind
  handleReportCleanmap(message: Message): void {
    const object = message.packet.payload
      .object as IDEVICE_EVENT_REPORT_CLEANMAP;
    message.respond("DEVICE_EVENT_REPORT_RSP", {
      result: 0,
      body: {
        cleanId: object.cleanId,
      },
    } as IDEVICE_EVENT_REPORT_RSP);
  }

  @bind
  handleBinDataReport(message: Message): void {
    const object = message.packet.payload
      .object as IDEVICE_CLEANMAP_BINDATA_REPORT_REQ;
    message.respond("DEVICE_CLEANMAP_BINDATA_REPORT_RSP", {
      result: 0,
      cleanId: object.cleanId,
    } as IDEVICE_CLEANMAP_BINDATA_REPORT_RSP);
  }

  @bind
  handleEventReport(message: Message): void {
    message.respond("UNK_11A7", { unk1: 0 } as IUNK_11A7);
  }

  addConnection(connection: Connection): void {
    const added = this.multiplexer.addConnection(connection);

    if (added && this.multiplexer.connectionCount === 2) {
      void this.handshake();
    }
  }

  handleMessage(message: Message): void {
    const handler = this.handlers[message.opname];

    if (
      message.packet.userId.value !== 0 &&
      message.packet.userId.value !== this.user.id.value
    ) {
      message.respond("COMMON_ERROR_REPLY", {
        result: 11001,
        error: "Target user is offline",
        opcode: message.packet.payload.opcode.value,
      } as ICOMMON_ERROR_REPLY);
      return;
    }

    if (handler) {
      handler(message);
    } else {
      this.debug(`unhandled opcode ${message.opname}`);
    }
  }

  toString(): string {
    return [
      `device: ${this.device.toString()}`,
      `user: ${this.user.toString()}`,
    ].join(" ");
  }

  disconnect(): void {
    this.debug("disconnecting...");

    return this.multiplexer.close();
  }

  send(opname: OPName, object: unknown = {}): boolean {
    return this.multiplexer.send({
      opname,
      userId: this.user.id,
      deviceId: this.device.id,
      object,
    });
  }

  recv(opname: OPName): Promise<Packet> {
    return new Promise((resolve) => {
      this.multiplexer.once(opname, resolve);
    });
  }

  sendRecv(
    sendOPName: OPName,
    recvOPName: OPName,
    sendObject: unknown = {}
  ): Promise<Packet> {
    return new Promise((resolve) => {
      const ret = this.send(sendOPName, sendObject);

      if (ret) {
        this.multiplexer.once(recvOPName, resolve);
      }
    });
  }
}
