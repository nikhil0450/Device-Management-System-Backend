// import net from 'net';

// export const pingDevice = async (req, res) => {
//   const deviceId = req.params.id;

//   const device = await Device.findById(deviceId);
//   if (!device) return res.status(404).json({ error: 'Device not found' });

//   const ip = device.ip_address;
//   const port = 80; 

//   const socket = new net.Socket();
//   const timeout = 3000;

//   socket.setTimeout(timeout);

//   socket.on('connect', () => {
//     socket.destroy();
//     res.json({ ping_output: `Success: ${ip} is reachable` });
//   }).on('error', () => {
//     res.json({ ping_output: `Fail: ${ip} is unreachable` });
//   }).on('timeout', () => {
//     res.json({ ping_output: `Timeout: ${ip} did not respond` });
//   }).connect(port, ip);
// };
