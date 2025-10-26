import React, { useState, useEffect } from 'react';
import Card from './Card';
import { User } from '../types';
import { translations, Language } from '../translations';

interface ProfileProps {
    user: User;
    onUpdateUser: (user: User) => void;
    language: Language;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, language }) => {
    const t = translations[language];
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);

    useEffect(() => {
        setName(user.name);
    }, [user.name]);

    const handleSave = () => {
        onUpdateUser({ ...user, name });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setName(user.name);
        setIsEditing(false);
    }

    // Mock data for usage statistics
    const stats = [
        { label: t.lessonPlansCreated, value: 12, icon: '📘' },
        { label: t.quizzesGenerated, value: 28, icon: '🎯' },
        { label: t.activitiesBrainstormed, value: 45, icon: '💡' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-coral-peach text-white text-4xl font-bold">
                    {getInitials(user.name)}
                </div>
                <div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-4xl font-bold font-display text-brand-dark bg-transparent border-b-2 border-sky-blue focus:outline-none"
                            autoFocus
                        />
                    ) : (
                        <h1 className="text-4xl font-bold font-display text-brand-dark">{user.name}</h1>
                    )}
                    <p className="text-lg text-gray-500 mt-1">{user.email}</p>
                </div>
            </div>

            <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-display font-semibold text-brand-dark">{t.accountInformation}</h3>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-sky-blue hover:bg-blue-500">{t.saveChanges}</button>
                            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium rounded-lg text-sky-blue bg-blue-50 hover:bg-blue-100">{t.editProfile}</button>
                    )}
                </div>
            </Card>

            <Card title={<h3 className="text-xl font-display font-semibold text-brand-dark">{t.usageStatistics}</h3>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map(stat => (
                        <div key={stat.label} className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <p className="text-3xl font-bold text-brand-dark">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Profile;
