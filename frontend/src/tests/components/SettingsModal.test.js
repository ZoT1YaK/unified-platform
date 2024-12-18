import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsModal from '../../components/SettingsModal/SettingsModal';
import {fetchNotificationPreferences, updateNotificationPreference} from '../../services/notificationService';

jest.mock('../../services/notificationService');

const mockPreferences = [
    {type_name: 'Email', noti_type_id: '1', preference: true},
    {type_name: 'SMS', noti_type_id: '2', preference: false},
    {type_name: 'Push', noti_type_id: '3', preference: true},
];

describe('SettingsModal Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
        fetchNotificationPreferences.mockResolvedValue(mockPreferences);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders settings modal correctly', async () => {
        render(<SettingsModal onClose={jest.fn()} isLeader={false}/>);
        await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    test('fetches and displays notification preferences', async () => {
        render(<SettingsModal onClose={jest.fn()} isLeader={false}/>);
        await waitFor(() => {
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('SMS')).toBeInTheDocument();
            expect(screen.getByText('Push')).toBeInTheDocument();
        });
    });

    test('toggles notification preference', async () => {
        updateNotificationPreference.mockResolvedValue();
        render(<SettingsModal onClose={jest.fn()} isLeader={false}/>);
        await waitFor(() => expect(screen.getByText('Email')).toBeInTheDocument());

        const emailToggle = screen.getByText('Email').nextSibling;
        fireEvent.click(emailToggle);

        await waitFor(() => expect(updateNotificationPreference).toHaveBeenCalledWith('mock-token', '1', false));
    });

    test('closes modal on close button click', () => {
        const onClose = jest.fn();
        render(<SettingsModal onClose={onClose} isLeader={false}/>);
        fireEvent.click(screen.getByText('×'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('handles errors when fetching preferences', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        fetchNotificationPreferences.mockRejectedValue(new Error('Failed to fetch preferences'));
        render(<SettingsModal onClose={jest.fn()} isLeader={false}/>);
        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error fetching preferences:', 'Failed to fetch preferences'));
        consoleErrorMock.mockRestore();
    });

    test('handles errors when updating preference', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        updateNotificationPreference.mockRejectedValue(new Error('Failed to update preference'));
        render(<SettingsModal onClose={jest.fn()} isLeader={false}/>);
        await waitFor(() => expect(screen.getByText('Email')).toBeInTheDocument());

        const emailToggle = screen.getByText('Email').nextSibling;
        fireEvent.click(emailToggle);

        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error updating preference:', 'Failed to update preference'));
        consoleErrorMock.mockRestore();
    });
});
