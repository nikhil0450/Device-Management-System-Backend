import Device from '../models/Device.js';
import axios from 'axios';
import ping from 'ping';

export const getDevices = async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
};

export const addDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDevice = async (req, res) => {
  await Device.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

export const pingDevice = async (req, res) => {
  const device = await Device.findById(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const result = await ping.promise.probe(device.ip_address);
  device.ping_status = result.alive ? 'Success' : 'Failed';
  device.ping_output = result.output || JSON.stringify(result);
  await device.save();

  res.json(device);
};

export const dashboardStats = async (req, res) => {
  const total = await Device.countDocuments();
  const success = await Device.countDocuments({ ping_status: 'Success' });
  const failed = await Device.countDocuments({ ping_status: 'Failed' });
  res.json({ total, success, failed });
};

export const fetchDeviceData = async (req, res) => {
  const { ip_address } = req.body;
  try {
    const apiRes = await axios.get(`https://api.incolumitas.com/?q=${ip_address}`);
    const data = apiRes.data;

    const update = {
      ip_address,
      dc_network: data.dc_network,
      asn_network: data.asn_network,
      asn_route: data.asn_route,
      location_latitude: data.latitude,
      location_longitude: data.longitude,
    };

    const device = await Device.findOneAndUpdate({ ip_address }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(device);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
