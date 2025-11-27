import React from 'react';

interface SimulatedGoogleAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string) => void;
    users: any[];
}

export const SimulatedGoogleAuthModal: React.FC<SimulatedGoogleAuthModalProps> = ({
    isOpen,
    onClose,
    onLogin,
    users
}) => {
    if (!isOpen) return null;
    const simUsers = users.filter(u => u.role !== 'admin').slice(0, 2);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 border-b text-center">
                    <h2 className="text-xl font-medium text-gray-800">Choose an account</h2>
                    <p className="text-sm text-gray-600">to continue to Complete Legal Aid</p>
                </div>
                <div className="p-2">
                    <ul className="divide-y">
                        {simUsers.map(user => (
                            <li key={user.id}>
                                <button
                                    onClick={() => { onLogin(user.email); onClose(); }}
                                    className="w-full text-left flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-lg"
                                >
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-blue-600 hover:bg-gray-100 p-2 rounded-md w-full"
                    >
                        Use another account
                    </button>
                </div>
            </div>
        </div>
    );
};
