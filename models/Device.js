import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  ip_address: { type: String, required: true },
  hostname: String,
  serial: String,
  ping_status: { type: String, enum: ['Success', 'Failed'], default: 'Failed' },
  ping_output: String,
  dc_network: String,
  asn_network: String,
  asn_route: String,
  location_latitude: String,
  location_longitude: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Device', deviceSchema);
