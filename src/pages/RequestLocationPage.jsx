import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Upload, X, Image, Music, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitLocationRequest, uploadLocationPhoto, uploadLocationAudio, deleteLocationPhoto } from '../services/locationRequestService';
import Swal from 'sweetalert2';

function RequestLocationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    category: '',
    historicalPeriod: '',
    submitterName: '',
    submitterEmail: user?.email || '',
    submitterPhone: '',
    audioStoryDescription: '',
  });

  const [photos, setPhotos] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioOption, setAudioOption] = useState(''); // 'upload' or 'generate'
  const [tempRequestId] = useState(`temp-${Date.now()}`);

  const categories = [
    'Architecture',
    'Monument',
    'Museum',
    'Religious Site',
    'Historical Building',
    'Cultural Center',
    'Park & Garden',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (photos.length + files.length > 10) {
      await Swal.fire({
        title: 'Too Many Photos',
        text: 'You can upload a maximum of 10 photos.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    setUploadingPhotos(true);

    try {
      const uploadPromises = files.map(file => 
        uploadLocationPhoto(file, user.id, tempRequestId)
      );

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => ({
          url: result.url,
          path: result.path
        }));

      setPhotos(prev => [...prev, ...successfulUploads]);

      if (successfulUploads.length < files.length) {
        await Swal.fire({
          title: 'Some Uploads Failed',
          text: `${successfulUploads.length} of ${files.length} photos uploaded successfully.`,
          icon: 'warning',
          confirmButtonColor: '#6f4e35'
        });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      await Swal.fire({
        title: 'Upload Error',
        text: 'Failed to upload photos. Please try again.',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (index) => {
    const photo = photos[index];
    const result = await deleteLocationPhoto(photo.path);
    
    if (result.success) {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      await Swal.fire({
        title: 'Invalid File',
        text: 'Please upload an audio file (MP3, WAV, etc.)',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      await Swal.fire({
        title: 'File Too Large',
        text: 'Audio file must be less than 10MB.',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    setUploadingAudio(true);

    try {
      const result = await uploadLocationAudio(file, user.id, tempRequestId);
      
      if (result.success) {
        setAudioFile(file);
        setAudioUrl(result.url);
      } else {
        await Swal.fire({
          title: 'Upload Failed',
          text: result.error || 'Failed to upload audio file.',
          icon: 'error',
          confirmButtonColor: '#6f4e35'
        });
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      await Swal.fire({
        title: 'Upload Error',
        text: 'Failed to upload audio. Please try again.',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.latitude || !formData.longitude || !formData.submitterName || !formData.submitterEmail || !formData.submitterPhone) {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    if (photos.length === 0) {
      await Swal.fire({
        title: 'No Photos',
        text: 'Please upload at least one photo of the location.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    // Validate audio requirement
    if (!audioOption) {
      await Swal.fire({
        title: 'Audio Required',
        text: 'Please choose an audio option: upload a file or provide a description.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    if (audioOption === 'upload' && !audioFile) {
      await Swal.fire({
        title: 'Audio Required',
        text: 'Please upload an audio file.',
        icon: 'warning',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    if (audioOption === 'generate') {
      const sentences = formData.audioStoryDescription.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length < 8 || sentences.length > 10) {
        await Swal.fire({
          title: 'Invalid Description',
          text: 'Please provide 8-10 sentences describing the location.',
          icon: 'warning',
          confirmButtonColor: '#6f4e35'
        });
        return;
      }
    }

    setLoading(true);

    try {
      const requestData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        category: formData.category,
        historical_period: formData.historicalPeriod,
        submitter_name: formData.submitterName,
        submitter_email: formData.submitterEmail,
        submitter_phone: formData.submitterPhone,
        photos: photos.map(p => p.url),
        audio_url: audioUrl || null,
        audio_description: audioOption === 'generate' ? formData.audioStoryDescription : null,
        status: 'pending'
      };

      const result = await submitLocationRequest(requestData);

      if (result.success) {
        await Swal.fire({
          title: 'Request Submitted!',
          text: 'Your location request has been submitted successfully. Our team will review it soon.',
          icon: 'success',
          confirmButtonColor: '#6f4e35'
        });
        navigate('/map');
      } else {
        await Swal.fire({
          title: 'Submission Failed',
          text: result.error || 'Failed to submit request. Please try again.',
          icon: 'error',
          confirmButtonColor: '#6f4e35'
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      await Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          Swal.fire({
            title: 'Location Found!',
            text: 'Your current location has been set.',
            icon: 'success',
            confirmButtonColor: '#6f4e35',
            timer: 1500
          });
        },
        (error) => {
          Swal.fire({
            title: 'Location Error',
            text: 'Unable to get your location. Please enter it manually.',
            icon: 'error',
            confirmButtonColor: '#6f4e35'
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-50 via-heritage-100 to-amber-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/map')}
          className="flex items-center gap-2 text-heritage-700 hover:text-heritage-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Map</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-heritage-700 to-heritage-800 px-8 py-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-10 h-10 text-amber-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Request a Location</h1>
                <p className="text-heritage-200">Help us expand Timișoara's heritage trail</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Location Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                Location Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Old Town Hall"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Description & Historical Significance <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the location, its history, and why it should be added to the heritage trail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Historical Period
                  </label>
                  <input
                    type="text"
                    name="historicalPeriod"
                    value={formData.historicalPeriod}
                    onChange={handleInputChange}
                    placeholder="e.g., 18th Century, 1890-1920"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  GPS Coordinates <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Latitude (e.g., 45.7489)"
                    step="0.000001"
                    className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Longitude (e.g., 21.2087)"
                    step="0.000001"
                    className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="mt-2 text-sm text-heritage-700 hover:text-heritage-900 font-medium flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Use My Current Location
                </button>
              </div>
            </div>

            {/* Photos Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                Photos <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-neutral-600">Upload up to 10 photos of the location (JPG, PNG)</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Location photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {photos.length < 10 && (
                  <label className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-heritage-500 hover:bg-heritage-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhotos}
                    />
                    {uploadingPhotos ? (
                      <Loader className="w-8 h-8 text-heritage-700 animate-spin" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-neutral-400 mb-2" />
                        <span className="text-sm text-neutral-600">Add Photos</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Audio Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                Audio Story <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-neutral-600">Choose how you want to provide the audio story for this location</p>

              {/* Audio Option Selection */}
              {!audioOption && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAudioOption('upload')}
                    className="p-6 border-2 border-neutral-300 rounded-lg hover:border-heritage-500 hover:bg-heritage-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Upload className="w-6 h-6 text-heritage-700 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Upload Your Audio</h3>
                        <p className="text-sm text-neutral-600">Upload a pre-recorded audio file (MP3, WAV, max 10MB)</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioOption('generate')}
                    className="p-6 border-2 border-neutral-300 rounded-lg hover:border-heritage-500 hover:bg-heritage-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Music className="w-6 h-6 text-heritage-700 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">Let Us Generate Audio</h3>
                        <p className="text-sm text-neutral-600">Provide a detailed description and we'll create the audio for you</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Upload Audio Option */}
              {audioOption === 'upload' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Upload Audio File</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioOption('');
                        setAudioFile(null);
                        setAudioUrl('');
                      }}
                      className="text-sm text-heritage-700 hover:text-heritage-900 font-medium"
                    >
                      Change Option
                    </button>
                  </div>

                  {audioFile ? (
                    <div className="flex items-center justify-between p-4 bg-heritage-50 border border-heritage-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Music className="w-8 h-8 text-heritage-700" />
                        <div>
                          <p className="font-medium text-neutral-900">{audioFile.name}</p>
                          <p className="text-sm text-neutral-600">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAudio}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-6 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-heritage-500 hover:bg-heritage-50 transition-colors">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                        disabled={uploadingAudio}
                      />
                      <div className="flex flex-col items-center">
                        {uploadingAudio ? (
                          <Loader className="w-12 h-12 text-heritage-700 animate-spin mb-3" />
                        ) : (
                          <Upload className="w-12 h-12 text-neutral-400 mb-3" />
                        )}
                        <p className="text-neutral-700 font-medium">
                          {uploadingAudio ? 'Uploading...' : 'Click to upload audio file'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">MP3, WAV (max 10MB)</p>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* Generate Audio Option */}
              {audioOption === 'generate' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Audio Story Description</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioOption('');
                        setFormData(prev => ({ ...prev, audioStoryDescription: '' }));
                      }}
                      className="text-sm text-heritage-700 hover:text-heritage-900 font-medium"
                    >
                      Change Option
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Write 8-10 sentences describing the location's story
                    </label>
                    <textarea
                      name="audioStoryDescription"
                      value={formData.audioStoryDescription}
                      onChange={handleInputChange}
                      placeholder="Tell us about this location's history, significance, interesting facts, and what makes it special. Be descriptive and engaging - this will be used to generate the audio narration that visitors will hear when they discover this location..."
                      rows={8}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-neutral-500">
                        💡 Tip: Write in an engaging, storytelling style. Include historical dates, key figures, and interesting anecdotes.
                      </p>
                      <p className="text-xs text-neutral-600">
                        {formData.audioStoryDescription.split(/[.!?]+/).filter(s => s.trim()).length} sentences
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                Your Contact Information <span className="text-red-500">*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="submitterName"
                    value={formData.submitterName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="submitterEmail"
                    value={formData.submitterEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    readOnly
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="submitterPhone"
                  value={formData.submitterPhone}
                  onChange={handleInputChange}
                  placeholder="+40 123 456 789"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="flex-1 px-6 py-3 border-2 border-heritage-700 text-heritage-700 rounded-lg font-semibold hover:bg-heritage-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingPhotos || uploadingAudio}
                className="flex-1 px-6 py-3 bg-heritage-700 text-white rounded-lg font-semibold hover:bg-heritage-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestLocationPage;
