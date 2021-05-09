import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

import axios = require('axios');
import { resolve } from 'node:path';



/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */

class LEDState {
  hue: number;
  sat: number;
  val: number;

  constructor(hue = 0, sat = 0, val = 0) {
    this.hue = hue;
    this.sat = sat;
    this.val = val;
  }
}
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 0,
    Hue: 0,
    Saturation: 0,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    axios.default.defaults.baseURL = 'localhost';
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Beckett Loose')
      .setCharacteristic(this.platform.Characteristic.Model, 'LightyMcLightFace')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '133742069');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    // register handlers for the Hue Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Hue);

    // register handlers for the Saturation Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Saturation);

    /*
    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    /*const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     *//*
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
      motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

      this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
      this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    }, 10000);*/
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    //this.exampleStates.Brightness = value as number;
    axios.default.post('/SetVal', {value});

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    let value;
    axios.default.get('/GetHue')
      .then((response) => {
        value = response.data;
      });

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
    return value;
  }

  // Handle GET Hue value from homekit
  async getHue(): Promise<CharacteristicValue> {
    //const hue = this.exampleStates.Hue;
    let hue;
    axios.default.get('/GetHue')
      .then((response) => {
        hue = response.data;
      });

    this.platform.log.debug('Get Characteristic Hue ->', hue);

    return hue;
  }

  // Handle SET Hue value from homekit
  async setHue(value: CharacteristicValue) {
    //this.exampleStates.Hue = value as number;
    axios.default.post('/SetHue', {value});

    this.platform.log.debug('Set Characteristic Hue ->', value);
  }

  // Handle GET Saturation value from homekit
  async getSaturation(): Promise<CharacteristicValue> {
    //const hue = this.exampleStates.Hue;
    let sat;
    axios.default.get('/GetSat')
      .then((response) => {
        sat = response.data;
      });

    this.platform.log.debug('Get Characteristic Saturation ->', sat);

    return sat;
  }

  // Handle SET Saturation value from homekit
  async setSaturation(value: CharacteristicValue) {
    //this.exampleStates.Brightness = value as number;
    axios.default.post('/SetSat', {value});
    this.platform.log.debug('Set Characteristic Saturation ->', value);
  }
}
