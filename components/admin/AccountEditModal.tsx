"use client";

import { ChangeEvent, use, useEffect, useState } from 'react';
import {User} from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {Edit, X} from "lucide-react";


export function AccountEditModal({ userId}: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null as File | null,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/users/${userId}`,{method: 'GET'});
                const userData = await response.json();
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    image: userData.image|| null,
                });
                if(userData.image){
                    setPreviewUrl(userData.image);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen, userId]);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);


    // Handle file selection and preview generation
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setFormData({ ...formData, image: e.target.files?.[0] || null })
      setPreviewUrl(URL.createObjectURL(file)); // Create local temporary blob URL
    } else {
      alert('Please select a valid image file.');
    }
  };
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission,
        try{
            if(formData.image){
                const uploadImage = new FormData();
                uploadImage.append('file', formData.image);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadImage,
                });

                if (!uploadRes.ok) {
                    throw new Error('Image upload failed');
                }

                const uploadResult = await uploadRes.json();
                const newImageUrl = uploadResult.url;
                formData.image=newImageUrl;
            }

            const response = await fetch(`/api/users/${userId}`, {
                method:'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            const updatedUser = await response.json();
            setUser(updatedUser);
            closeModal();

            
        }
        catch (error) {
            console.error('Error updating user:', error);
        }

        

        
    }

    return (
        <div>
            <button
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white rounded  px-5 py-3 px-2 font-medium text-black transition hover:bg-blue-700"
            >
                <Edit size={18} />
                                Edit Profile
            </button>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">Edit Account</h2>
                        
                        <button
                            onClick={closeModal}
                            className="bg-gray-500 text-black px-4 py-2 rounded hover:bg-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Profile picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleImageChange}
                                />
                                {previewUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="mt-4 h-32 w-32 object-cover rounded-full"
                                    />
                                )}

                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                Cancel
                                </button>
                                <button
                                type="submit"
                                
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                Update
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );

}
