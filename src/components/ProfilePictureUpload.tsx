import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, Upload, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarUpdate: (url: string | null) => void;
}

const ProfilePictureUpload = ({ userId, currentAvatarUrl, onAvatarUpdate }: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setShowMenu(false);

    try {
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    setShowMenu(false);

    try {
      // Delete from storage
      const pathParts = currentAvatarUrl.split('/avatars/');
      if (pathParts[1]) {
        await supabase.storage.from('avatars').remove([pathParts[1]]);
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (error) throw error;

      onAvatarUpdate(null);
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative"
      >
        <div 
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => setShowMenu(!showMenu)}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-background animate-spin" />
          ) : currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-background" />
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-foreground" />
          </div>
        </div>

        {/* Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 left-0 z-50 glass-card p-2 min-w-[160px]"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
              {currentAvatarUrl && (
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-traffic-high/10 transition-colors text-sm text-traffic-high"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Photo
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;
