import express from 'express';
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
  pingDevice,
  dashboardStats,
  fetchDeviceData,
} from '../controllers/deviceController.js';

const router = express.Router();

router.get('/devices', getDevices);
router.post('/devices', addDevice);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);
router.post('/devices/:id/ping', pingDevice);
router.get('/dashboard-stats', dashboardStats);
router.post('/devices/fetch', fetchDeviceData);

export default router;
