import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Bot, 
  ArrowLeft, 
  Calendar,
  Loader2,
  CheckCircle2,
  Link2,
  CloudUpload,
  Clock
} from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import { 
  useCreateMeetingMutation, 
  useDispatchBotMutation, 
  useRequestUploadUrlMutation, 
  useConfirmUploadMutation 
} from '../api/meetingsApi';
import toast from 'react-hot-toast';
import axios from 'axios';

const UploadPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); 
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'google_meet',
    meeting_url: '',
    scheduled_at: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  });

  const [createMeeting] = useCreateMeetingMutation();
  const [dispatchBot] = useDispatchBotMutation();
  const [requestUploadUrl] = useRequestUploadUrlMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
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
      const meetingResult = await createMeeting({
        ...formData,
        platform: activeTab === 'upload' ? 'upload' : formData.platform
      }).unwrap();
      const meetingId = meetingResult.data.id;

      if (activeTab === 'upload' && file) {
        toast.loading('Requesting upload permission...', { id: toastId });
        const uploadRequest = await requestUploadUrl({
          meetingId,
          fileName: file.name,
          contentType: file.type
        }).unwrap();
        
        const { url, key } = uploadRequest.data;

        toast.loading('Uploading file to cloud...', { id: toastId });
        await axios.put(url, file, {
          headers: { 'Content-Type': file.type }
        });

        toast.loading('Finalising...', { id: toastId });
        await confirmUpload({ meetingId, s3Key: key }).unwrap();
        toast.success('Meeting uploaded and processing!', { id: toastId });
      } else if (activeTab === 'bot') {
        const scheduledTime = new Date(formData.scheduled_at);
        const isNow = (scheduledTime - new Date()) < 5 * 60 * 1000;

        if (isNow) {
          toast.loading('Dispatching bot assistant...', { id: toastId });
          try {
            await dispatchBot(meetingId).unwrap();
            toast.success('Bot assistant dispatched!', { id: toastId });
          } catch (botError) {
            toast.error('Meeting scheduled, but immediate join failed.', { id: toastId });
          }
        } else {
          toast.success('Meeting scheduled! Bot will join at the set time.', { id: toastId });
        }
      }

      navigate(`/dashboard/meetings/${meetingId}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create meeting', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Meetings</span>
      </button>

      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Meeting</h1>
        <p className="text-gray-500 mb-10">Choose how you want to ingest your meeting audio.</p>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border rounded-2xl mb-10 w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all
              ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}
            `}
          >
            <CloudUpload className="w-4 h-4" />
            Upload Recording
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all
              ${activeTab === 'bot' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}
            `}
          >
            <Bot className="w-4 h-4" />
            Invite Bot
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Meeting Title</label>
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Description (Optional)</label>
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Audio File (MP3, WAV, M4A)</label>
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
                      <p className="text-white font-bold">{file.name}</p>
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
                      <p className="text-white font-bold">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Maximum file size: 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Bot Name</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Audicle Assistant"
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-4 py-3 text-gray-600 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Meeting Link</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="url"
                    name="meeting_url"
                    placeholder="https://meet.google.com/..."
                    value={formData.meeting_url}
                    onChange={handleInputChange}
                    className="w-full bg-brand-bg border border-brand-border focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-3 text-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Scheduled Time
                </label>
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
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (activeTab === 'upload' && !file)}
              className={`
                px-10 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white transition-all flex items-center gap-2
                ${loading || (activeTab === 'upload' && !file) 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20'}
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
    </AppLayout>
  );
};

export default UploadPage;
