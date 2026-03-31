import React, { useState, useEffect } from 'react';
import { Upload, Save, X, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const HeroImages = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const { success: showSuccess, error: showError } = useToast();

  const [editingHero, setEditingHero] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize heroes array with 4 positions
  const positions = [1, 2, 3, 4];

  useEffect(() => {
    loadHeroes();
  }, []);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getHeroes();
      const heroList = Array.isArray(data) ? data : data?.data || [];
      
      // Ensure we have all 4 positions
      const heroMap = {};
      heroList.forEach(hero => {
        heroMap[hero.position] = hero;
      });

      const completeHeroes = positions.map(pos => 
        heroMap[pos] || {
          position: pos,
          imageUrl: '',
          isActive: true,
        }
      );

      setHeroes(completeHeroes);
    } catch (error) {
      showError('Failed to load hero images');
      console.error('Error loading heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, position) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingIndex(position);
      const uploaded = await adminApi.uploadImage(file);
      
      if (uploaded && uploaded.url) {
        const updatedHeroes = heroes.map(hero =>
          hero.position === position
            ? { ...hero, imageUrl: uploaded.url }
            : hero
        );
        setHeroes(updatedHeroes);
        showSuccess('Image uploaded successfully');
      }
    } catch (error) {
      showError(error.message || 'Failed to upload image');
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  const handleEditClick = (hero) => {
    setEditingHero({ ...hero });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingHero.imageUrl) {
      showError('Please upload an image');
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateHero(editingHero.position, editingHero);
      
      const updatedHeroes = heroes.map(hero =>
        hero.position === editingHero.position ? editingHero : hero
      );
      setHeroes(updatedHeroes);
      
      showSuccess('Hero image updated successfully');
      setShowEditModal(false);
      setEditingHero(null);
    } catch (error) {
      showError(error.message || 'Failed to update hero image');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (position, currentStatus) => {
    try {
      await adminApi.updateHeroStatus(position, !currentStatus);
      const updatedHeroes = heroes.map(hero =>
        hero.position === position
          ? { ...hero, isActive: !currentStatus }
          : hero
      );
      setHeroes(updatedHeroes);
      showSuccess('Status updated successfully');
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleDeleteImage = async (position) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      await adminApi.deleteHero(position);
      const updatedHeroes = heroes.map(hero =>
        hero.position === position
          ? {
              position: hero.position,
              imageUrl: '',
              isActive: true,
            }
          : hero
      );
      setHeroes(updatedHeroes);
      showSuccess('Hero image deleted successfully');
    } catch (error) {
      showError('Failed to delete hero image');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Hero Images Management</h1>
        <p className="text-gray-500 mt-1">Manage the 4 hero banner images displayed on the home page</p>
      </div>

      {/* Hero Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {heroes.map((hero) => (
          <div key={hero.position} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Image Preview */}
            <div className="relative h-48 bg-gray-100">
              {hero.imageUrl ? (
                <>
                  <img
                    src={hero.imageUrl}
                    alt={`Hero ${hero.position}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(hero)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      title="Edit"
                    >
                      <Upload size={18} />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(hero.position, hero.isActive)}
                      className={`p-2 rounded-lg transition text-white ${
                        hero.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      title={hero.isActive ? 'Active' : 'Inactive'}
                    >
                      {hero.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteImage(hero.position)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      title="Delete"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                  <Upload size={40} className="text-gray-300" />
                  <p className="text-gray-400">No image uploaded</p>
                </div>
              )}
            </div>

            {/* Hero Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Position {hero.position}
                </span>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    hero.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {hero.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {!hero.imageUrl && (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, hero.position)}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg cursor-pointer transition font-medium text-sm">
                    Upload Image
                  </div>
                </label>
              )}

              {hero.imageUrl && (
                <button
                  onClick={() => handleEditClick(hero)}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium text-sm"
                >
                  Change Image
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingHero && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Hero {editingHero.position}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Image Preview in Modal */}
            {editingHero.imageUrl && (
              <img
                src={editingHero.imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            {/* Upload or Change Image */}
            <label className="block">
              <p className="text-sm font-medium text-gray-700 mb-2">Change Image</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, editingHero.position)}
                disabled={uploadingIndex === editingHero.position}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
              />
              {uploadingIndex === editingHero.position && (
                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
              )}
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroImages;
