import Device from '../models/Device.js';
import axios from 'axios';
// import ping from 'ping';
import net from 'net';

export const getDevices = async (req, res) => {
  try {
    const { ip, status, page = 1, limit = 3 } = req.query;
    const query = { user: req.user.userId };

    if (ip) query.ip_address = { $regex: ip, $options: 'i' };
    if (status) query.ping_status = status;

    const devices = await Device.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Device.countDocuments(query);

    res.json({
      devices,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addDevice = async (req, res) => {
  try {
    const device = new Device({ ...req.body, user: req.user.userId });
    await device.save();
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId }, 
      req.body,
      { new: true }
    );
    if (!device) return res.status(404).json({ error: 'Not found' });
    res.json(device);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDevice = async (req, res) => {
  const device = await Device.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!device) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
};

// export const pingDevice = async (req, res) => {
//   const device = await Device.findOne({ _id: req.params.id, user: req.user.userId });
//   if (!device) return res.status(404).json({ error: 'Not found' });

//   const result = await ping.promise.probe(device.ip_address);
//   device.ping_status = result.alive ? 'Success' : 'Failed';
//   device.ping_output = result.output || JSON.stringify(result);
//   await device.save();

//   res.json(device);
// };

export const pingDevice = async (req, res) => {
  const deviceId = req.params.id;

  const device = await Device.findById(deviceId);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const ip = device.ip_address;
  const port = 80; 

  const socket = new net.Socket();
  const timeout = 3000;

  socket.setTimeout(timeout);

  socket.on('connect', () => {
    socket.destroy();
    res.json({ ping_output: `Success: ${ip} is reachable` });
  }).on('error', () => {
    res.json({ ping_output: `Fail: ${ip} is unreachable` });
  }).on('timeout', () => {
    res.json({ ping_output: `Timeout: ${ip} did not respond` });
  }).connect(port, ip);
};

export const dashboardStats = async (req, res) => {
  const userFilter = { user: req.user.userId };
  const total = await Device.countDocuments(userFilter);
  const success = await Device.countDocuments({ ...userFilter, ping_status: 'Success' });
  const failed = await Device.countDocuments({ ...userFilter, ping_status: 'Failed' });
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

    const device = await Device.findOneAndUpdate(
      { ip_address, user: req.user.userId }, 
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(device);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
