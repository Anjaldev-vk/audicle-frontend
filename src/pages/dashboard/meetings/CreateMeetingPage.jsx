import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Bot, 
  ArrowLeft, 
  Globe, 
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  CloudUpload,
  Clock
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import API from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'bot'
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'upload',
    meeting_url: '',
    scheduled_at: new Date().toISOString().slice(0, 16) // Default to now
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit example
        toast.error('File too large. Max 100MB.');
        return;
      }
      setFile(selectedFile);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selectedFile.name.split('.')[0] }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    
    setLoading(true);
    const toastId = toast.loading('Creating meeting...');

    try {
      // 1. Create meeting entry
      const meetingResponse = await API.post('meetings/', {
        ...formData,
        platform: activeTab === 'upload' ? 'upload' : formData.platform
      });
      const meetingId = meetingResponse.data.data.id;

      if (activeTab === 'upload' && file) {
        toast.loading('Requesting upload permission...', { id: toastId });
        
        // 2. Request presigned URL
        const uploadRequest = await API.post(`meetings/${meetingId}/upload/request-url/`, {
          file_name: file.name,
          content_type: file.type
        });
        
        const { url, key } = uploadRequest.data.data;

        // 3. Upload to S3 directly
        toast.loading('Uploading file to cloud...', { id: toastId });
        await axios.put(url, file, {
          headers: { 'Content-Type': file.type }
        });

        // 4. Confirm upload to backend
        toast.loading('Finalising...', { id: toastId });
        await API.post(`meetings/${meetingId}/upload/confirm/`, {
          s3_key: key
        });

        toast.success('Meeting uploaded and processing!', { id: toastId });
      } else if (activeTab === 'bot') {
        // Smart Dispatch (Phase 9)
        // Only dispatch immediately if scheduled for 'now' (within next 5 mins)
        const scheduledTime = new Date(formData.scheduled_at);
        const isNow = (scheduledTime - new Date()) < 5 * 60 * 1000;

        if (isNow) {
          toast.loading('Dispatching bot assistant...', { id: toastId });
          try {
            await API.post(`meetings/${meetingId}/bot/dispatch/`);
            toast.success('Bot assistant dispatched!', { id: toastId });
          } catch (botError) {
            console.error('Bot dispatch failed', botError);
            toast.error('Meeting scheduled, but immediate join failed.', { id: toastId });
          }
        } else {
          toast.success('Meeting scheduled! Bot will join at the set time.', { id: toastId });
        }
      }

      navigate(`/dashboard/meetings/${meetingId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create meeting', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Meetings
      </button>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Meeting</h1>
        <p className="text-gray-500 mb-10">Choose how you want to ingest your meeting audio.</p>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border rounded-2xl mb-10 w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}
            `}
          >
            <CloudUpload className="w-4 h-4" />
            Upload Recording
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === 'bot' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}
            `}
          >
            <Bot className="w-4 h-4" />
            Invite Bot
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Info */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Meeting Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Q4 Engineering Sync"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description (Optional)</label>
              <textarea
                name="description"
                rows="3"
                placeholder="What is this meeting about?"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none resize-none"
              />
            </div>
          </div>

          {activeTab === 'upload' ? (
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Audio File (MP3, WAV, M4A)</label>
              <div 
                className={`
                  border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all
                  ${file ? 'border-green-500/30 bg-green-500/5' : 'border-brand-border hover:border-blue-500/30 hover:bg-white/[0.02]'}
                `}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${file ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    {file ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <Upload className="w-8 h-8 text-gray-500" />}
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="text-white font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="text-xs text-red-400 mt-2 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-white font-semibold">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bot Name</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Audicle Assistant"
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-4 py-3 text-gray-600 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Meeting Link</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="url"
                    name="meeting_url"
                    placeholder="https://zoom.us/j/..."
                    value={formData.meeting_url}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-3 text-white transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-2 px-1">
                  Our bot will automatically join the meeting at the scheduled time to record and transcribe.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Scheduled Time
                </label>
                
                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { label: 'In 15 Mins', value: 15 },
                    { label: 'In 1 Hour', value: 60 },
                    { label: 'Tomorrow', value: 1440 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        const date = new Date();
                        date.setMinutes(date.getMinutes() + opt.value);
                        setFormData(prev => ({ ...prev, scheduled_at: date.toISOString().slice(0, 16) }));
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-blue-600/10 border border-brand-border hover:border-blue-500/30 rounded-lg text-[10px] font-bold text-gray-400 hover:text-blue-400 transition-all uppercase tracking-tight"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg border border-brand-border group-hover:border-blue-500/30 focus:border-blue-500/50 rounded-xl px-4 py-4 text-white transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-hover:text-blue-500 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                
                <p className="text-[10px] text-indigo-500/60 mt-2 px-1 font-medium italic">
                  Note: Bot will auto-join ±5 minutes from this time.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 rounded-xl font-semibold text-sm text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (activeTab === 'upload' && !file)}
              className={`
                px-10 py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center gap-2
                ${loading || (activeTab === 'upload' && !file) 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {activeTab === 'upload' ? 'Upload & Start' : 'Schedule Meeting'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateMeetingPage;
