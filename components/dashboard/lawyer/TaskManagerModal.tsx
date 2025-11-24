
import React, { useState, useMemo } from 'react';
import { CloseIcon, PlusCircleIcon, CalendarIcon, CheckIcon, TrashIcon, ClipboardDocumentCheckIcon, ClockIcon } from '../../icons';
import type { Appointment } from '../../../types';

export interface ManualTask {
    id: string;
    title: string;
    completed: boolean;
    dueDate: string; // ISO date string
    dueTime?: string;
}

interface TaskManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: Appointment[];
    manualTasks: ManualTask[];
    setManualTasks: React.Dispatch<React.SetStateAction<ManualTask[]>>;
}

export const TaskManagerModal: React.FC<TaskManagerModalProps> = ({ isOpen, onClose, appointments, manualTasks, setManualTasks }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Convert appointments to task-like structure
    const appointmentTasks = useMemo(() => {
        return appointments.map(appt => ({
            id: `appt-${appt.id}`,
            title: `${appt.type}: ${appt.title || 'Untitled Appointment'}`,
            completed: new Date(appt.date) < new Date() && appt.status === 'Confirmed', // Auto-complete past confirmed appointments for demo
            dueDate: appt.date,
            dueTime: appt.time,
            isAutomated: true,
            source: appt
        }));
    }, [appointments]);

    // This conditional return must be AFTER all hooks to preventing Render Error #310
    if (!isOpen) return null;

    const allTasks = [...manualTasks.map(t => ({ ...t, isAutomated: false })), ...appointmentTasks];

    const filteredTasks = allTasks.filter(t => 
        activeTab === 'pending' ? !t.completed : t.completed
    ).sort((a, b) => {
        // Sort by date/time
        const dateA = new Date(`${a.dueDate}T${a.dueTime?.replace(' ', ':') || '00:00'}`);
        const dateB = new Date(`${b.dueDate}T${b.dueTime?.replace(' ', ':') || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
    });

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask: ManualTask = {
            id: `manual-${Date.now()}`,
            title: newTaskTitle,
            completed: false,
            dueDate: new Date().toISOString().split('T')[0], // Default to today
            dueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setManualTasks(prev => [newTask, ...prev]);
        setNewTaskTitle('');
    };

    const toggleTaskCompletion = (taskId: string, isAutomated: boolean) => {
        if (isAutomated) {
            // For automated tasks, we might just visually toggle them in a local view or 
            // in a real app, update the appointment status. For now, let's alert.
            alert("Appointment status is managed via the Calendar.");
            return;
        }

        setManualTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (taskId: string) => {
        setManualTasks(prev => prev.filter(t => t.id !== taskId));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl bg-white dark:bg-[#050816] border border-cla-border dark:border-cla-border-dark shadow-2xl animate-scale-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-cla-border dark:border-cla-border-dark bg-cla-surface dark:bg-cla-surface-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cla-gold/10 rounded-lg text-cla-gold">
                            <ClipboardDocumentCheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-cla-text dark:text-white">Task Manager</h2>
                            <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Manage your to-dos and schedule.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-white/[0.02]">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'pending' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Pending ({allTasks.filter(t => !t.completed).length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Completed ({allTasks.filter(t => t.completed).length})
                    </button>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-6 bg-cla-bg dark:bg-cla-bg-dark custom-scrollbar">
                    <div className="space-y-3">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                    task.completed 
                                        ? 'bg-gray-50 dark:bg-white/5 border-transparent opacity-75' 
                                        : 'bg-white dark:bg-cla-surface-dark border-cla-border dark:border-cla-border-dark hover:border-cla-gold/30'
                                }`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <button 
                                        onClick={() => toggleTaskCompletion(task.id, task.isAutomated)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            task.completed 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'border-gray-300 dark:border-gray-600 hover:border-cla-gold'
                                        }`}
                                    >
                                        {task.completed && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate ${task.completed ? 'text-gray-500 line-through' : 'text-cla-text dark:text-white'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {task.isAutomated ? (
                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                    <CalendarIcon className="w-3 h-3" /> Automated
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                                    <ClipboardDocumentCheckIcon className="w-3 h-3" /> Manual
                                                </span>
                                            )}
                                            
                                            {(task.dueDate || task.dueTime) && (
                                                <span className="flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {task.dueDate && new Date(task.dueDate).toLocaleDateString()} 
                                                    {task.dueTime && ` • ${task.dueTime}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!task.isAutomated && (
                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-12">
                                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No {activeTab} tasks found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Input */}
                <div className="p-4 border-t border-cla-border dark:border-cla-border-dark bg-white dark:bg-cla-surface-dark">
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTaskTitle} 
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..." 
                            className="flex-1 bg-gray-100 dark:bg-black/20 border border-cla-border dark:border-cla-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cla-gold dark:text-white transition-shadow"
                        />
                        <button 
                            type="submit" 
                            disabled={!newTaskTitle.trim()}
                            className="bg-cla-gold hover:bg-cla-gold-darker text-cla-text font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
