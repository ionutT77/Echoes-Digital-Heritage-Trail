import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Calendar, Tag, FileAudio, Image, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { createCulturalNode } from '../services/nodesService';
import { useAuth } from '../contexts/AuthContext';

function AdminPage() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    latitude: '',
    longitude: '',
    proximityRadius: '100',
    description: '',
    historicalPeriod: '',
    category: 'Architecture',
    audioUrl: '',
    audioDuration: '',
    primaryImageUrl: '',
    images: []
  });

  const [currentImage, setCurrentImage] = useState({
    url: '',
    caption: '',
    historicalDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newNode = {
      slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      proximityRadius: parseInt(formData.proximityRadius),
      audioDuration: parseInt(formData.audioDuration)
    };

    const result = await createCulturalNode(newNode);
    
    if (result.success) {
      await Swal.fire({
        title: 'Node Created Successfully!',
        text: 'Your cultural node has been saved to the database.',
        icon: 'success',
        confirmButtonColor: '#6f4e35'
      });
    } else {
      await Swal.fire({
        title: 'Node Created!',
        text: `Error: ${result.message}`,
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
    }

    setFormData({
      title: '',
      latitude: '',
      longitude: '',
      proximityRadius: '100',
      description: '',
      historicalPeriod: '',
      category: 'Architecture',
      audioUrl: '',
      audioDuration: '',
      primaryImageUrl: '',
      images: []
    });

    setCurrentImage({
      url: '',
      caption: '',
      historicalDate: ''
    });
  };

  const handleAddImage = () => {
    if (currentImage.url && currentImage.caption && currentImage.historicalDate) {
      setFormData({
        ...formData,
        images: [...formData.images, currentImage]
      });
      setCurrentImage({
        url: '',
        caption: '',
        historicalDate: ''
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (e) => {
    const { name, value } = e.target;
    setCurrentImage({
      ...currentImage,
      [name]: value
    });
  };

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-heritage-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if user is not admin or if is_admin is undefined
  if (!profile || profile.is_admin !== true) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Map</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-heritage-200 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-heritage-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Create Cultural Node</h1>
              <p className="text-neutral-600">Add a new heritage location to the map</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Title
                </span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="e.g., The Old Theatre"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Latitude
                  </span>
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                  placeholder="40.7484"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Longitude
                  </span>
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                  placeholder="-73.9857"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Proximity Radius (meters)
              </label>
              <input
                type="number"
                name="proximityRadius"
                value={formData.proximityRadius}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Historical Period
                </span>
              </label>
              <input
                type="text"
                name="historicalPeriod"
                value={formData.historicalPeriod}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="e.g., 1872-1954"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
              >
                <option value="Architecture">Architecture</option>
                <option value="Event">Event</option>
                <option value="Person">Person</option>
                <option value="Artifact">Artifact</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 resize-none transition-colors"
                placeholder="Write a detailed historical description..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                <span className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4" />
                  Audio URL
                </span>
              </label>
              <input
                type="url"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="/audio/story.mp3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Audio Duration (seconds)
              </label>
              <input
                type="number"
                name="audioDuration"
                value={formData.audioDuration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="142"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Primary Image URL
                </span>
              </label>
              <input
                type="url"
                name="primaryImageUrl"
                value={formData.primaryImageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Additional Images
              </h3>
              
              <div className="space-y-4 bg-neutral-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={currentImage.url}
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Caption
                    </label>
                    <input
                      type="text"
                      name="caption"
                      value={currentImage.caption}
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                      placeholder="Description of the image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Historical Date
                    </label>
                    <input
                      type="text"
                      name="historicalDate"
                      value={currentImage.historicalDate}
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
                      placeholder="e.g., 1890s, 19th century, Modern"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddImage}
                  className="w-full bg-heritage-600 hover:bg-heritage-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Image to List
                </button>
              </div>

              {formData.images.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-neutral-700">
                    Added Images ({formData.images.length}):
                  </p>
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-lg"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {image.caption}
                        </p>
                        <p className="text-xs text-neutral-600 truncate">
                          {image.url}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Date: {image.historicalDate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-heritage-700 hover:bg-heritage-800 text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-6"
            >
              <Plus className="w-5 h-5" />
              Create Cultural Node
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;