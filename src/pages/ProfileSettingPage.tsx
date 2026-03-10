import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import type { User } from "../interface/User";
import Snackbar from "../components/Snackbar";

interface EditFormData {
    phone_number: string;
    new_password: string;
    confirm_password: string;
}

interface ValidateMessage {
    phone_number?: string;
    new_password?: string;
    confirm_password?: string;
}

export default function ProfileSettingPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<EditFormData>({ phone_number: "", new_password: "", confirm_password: "" });
    const [validateMessage, setValidateMessage] = useState<ValidateMessage>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: "error" | "success" } | null>(null);
    const [error, setError] = useState<string | null>(null)
    const closeSnackbar = useCallback(() => {
        setError(null)
        setSnackbar(null)
    }, [])

    const userInitials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const currentPhoto = photoPreview ?? userProfile?.photo_url ?? user?.photo_url;

    const fetchProfile = async () => {
        const userId = useAuthStore.getState().user?.userId;
        setIsLoading(true);
        try {
            const res = await api.get(`/users/${userId}`);
            const data = res.data.data;
            const profile = {
                position: data.position?.name,
                phone_number: data.phone_number,
                photo_url: data.photo_url,
                name: data.name,
                email: data.email,
            };
            setUserProfile(profile);
            setFormData((f) => ({ ...f, phone_number: profile?.phone_number ?? "" }));
            useAuthStore.getState().updateUser({ photo_url: data.photo_url, name: data.name });
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to load profile"
            setError(message)
            setSnackbar({ message, type: "error" })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const errors: ValidateMessage = {};
        if (formData.new_password && formData.new_password.length < 8) {
            errors.new_password = "Password must be at least 8 characters";
        }
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            errors.confirm_password = "Passwords do not match";
        }
        if (formData.confirm_password && !formData.new_password) {
            errors.new_password = "Please enter a new password";
        }
        if (formData.phone_number && !/^\+?\d{7,15}$/.test(formData.phone_number)) {
            errors.phone_number = "Invalid phone number format";
        }
        setValidateMessage(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        const userId = useAuthStore.getState().user?.userId;
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            if (photoFile) {
                const fd = new FormData();
                fd.append("profile_photo", photoFile);
                fd.append("phone_number", formData.phone_number);
                if (formData.new_password) {
                    fd.append("password", formData.new_password);
                }
                await api.patch(`/users/${userId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                const body: Record<string, string> = { phone_number: formData.phone_number };
                if (formData.new_password) {
                    body.password = formData.new_password;
                }
                await api.patch(`/users/${userId}`, body);
            }
            await fetchProfile();
            setIsEditMode(false);
            setPhotoFile(null);
            setPhotoPreview(null);
            setFormData((f) => ({ ...f, new_password: "", confirm_password: "" }));
            setValidateMessage({});
            setSnackbar({ message: "Profile updated successfully!", type: "success" });
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Profile update failed"
            setError(message)
            setSnackbar({ message, type: "error" })
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setFormData((f) => ({ ...f, phone_number: userProfile?.phone_number ?? "", new_password: "", confirm_password: "" }));
        setValidateMessage({});
    };

    return (
        <>
            <Navbar />
            {error && <Snackbar message={error} type="error" onClose={closeSnackbar} />}
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />}
            <div className="pt-20 min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={() => navigate("/")}
                        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                                            {currentPhoto ? (
                                                <img src={currentPhoto} alt="User Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{userInitials}</span>
                                            )}
                                        </div>
                                        {isEditMode && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-700 transition-colors"
                                                    title="Change photo"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handlePhotoChange}
                                                />
                                            </>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.name}</h2>
                                    <p className="text-sm text-slate-500 mb-1">{user?.email}</p>
                                    {userProfile?.position && (
                                        <p className="text-sm font-medium text-red-600 mb-1">{userProfile.position}</p>
                                    )}
                                    {userProfile?.phone_number && (
                                        <p className="text-sm text-slate-500">{userProfile.phone_number}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {isEditMode ? "Update your profile information" : "Your profile information"}
                                        </p>
                                    </div>
                                    {!isEditMode && (
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="space-y-5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                                <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {!isEditMode && (
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                                                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">{user?.name || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                                                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">{user?.email || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Photo</label>
                                                    <div className="px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                                        {currentPhoto ? (
                                                            <img src={currentPhoto} alt="Profile" className="h-14 w-14 rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">No photo uploaded</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Position</label>
                                                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">{userProfile?.position || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                                                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">{userProfile?.phone_number || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-500 mb-1">Password</label>
                                                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 tracking-widest">••••••••</p>
                                                </div>
                                            </div>
                                        )}

                                        {isEditMode && (
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                                    <input type="text" value={user?.name ?? ""} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                                    <input type="email" value={user?.email ?? ""} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                                                    <input type="text" value={userProfile?.position ?? "-"} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed" />
                                                </div>

                                                <div className="border-t border-slate-200 pt-5">
                                                    <p className="text-sm font-semibold text-slate-700 mb-5">Editable Information</p>

                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                                                                {currentPhoto ? (
                                                                    <img src={currentPhoto} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{userInitials}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    disabled={isSubmitting}
                                                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                                >
                                                                    Choose Photo
                                                                </button>
                                                                {photoFile && <p className="text-xs text-slate-500 mt-1">{photoFile.name}</p>}
                                                                <p className="text-xs text-slate-400 mt-1">JPG, JPEG, PNG up to 2MB</p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handlePhotoChange}
                                                        />
                                                    </div>

                                                    <div className="mb-5">
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            value={formData.phone_number}
                                                            onChange={(e) => setFormData((f) => ({ ...f, phone_number: e.target.value }))}
                                                            disabled={isSubmitting}
                                                            placeholder="e.g. +62812345678"
                                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${validateMessage.phone_number ? "border-red-500" : "border-slate-300"}`}
                                                        />
                                                        {validateMessage.phone_number && (
                                                            <p className="mt-1 text-sm text-red-600">{validateMessage.phone_number}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 mb-4">
                                                            Change Password <span className="text-slate-400 font-normal">(optional)</span>
                                                        </p>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPassword ? "text" : "password"}
                                                                        value={formData.new_password}
                                                                        onChange={(e) => setFormData((f) => ({ ...f, new_password: e.target.value }))}
                                                                        disabled={isSubmitting}
                                                                        placeholder="Minimum 8 characters"
                                                                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${validateMessage.new_password ? "border-red-500" : "border-slate-300"}`}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowPassword((v) => !v)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                    >
                                                                        {showPassword ? (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                {validateMessage.new_password && (
                                                                    <p className="mt-1 text-sm text-red-600">{validateMessage.new_password}</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showConfirmPassword ? "text" : "password"}
                                                                        value={formData.confirm_password}
                                                                        onChange={(e) => setFormData((f) => ({ ...f, confirm_password: e.target.value }))}
                                                                        disabled={isSubmitting}
                                                                        placeholder="Re-enter new password"
                                                                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${validateMessage.confirm_password ? "border-red-500" : "border-slate-300"}`}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                    >
                                                                        {showConfirmPassword ? (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                {validateMessage.confirm_password && (
                                                                    <p className="mt-1 text-sm text-red-600">{validateMessage.confirm_password}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-2xl font-semibold hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                </svg>
                                                                Saving...
                                                            </span>
                                                        ) : "Save Changes"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancel}
                                                        disabled={isSubmitting}
                                                        className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 px-4 rounded-2xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}