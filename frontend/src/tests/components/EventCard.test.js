import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EventCard from '../../components/EventCard/EventCard';
import {fetchEvents, updateRSVP} from '../../services/eventService';

jest.mock('../../services/eventService');

const mockEvents = [
    {_id: '1', title: 'Event 1', date: '2023-12-31', time: '10:00 AM', location: 'New York', response: 'Joined'},
    {_id: '2', title: 'Event 2', date: '2023-11-30', time: '2:00 PM', location: 'Online', response: 'Declined'},
];

describe('EventCard Component', () => {
    beforeEach(() => {
        fetchEvents.mockResolvedValue(mockEvents);
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<EventCard isLeader={true}/>);
    });

    test('displays loading state initially', () => {
        render(<EventCard isLeader={true}/>);
        expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });

    test('displays events correctly after loading', async () => {
        render(<EventCard isLeader={true}/>);
        await waitFor(() => expect(fetchEvents).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading events...')).not.toBeInTheDocument());

        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
        expect(screen.getByText('Date: 31.12.2023')).toBeInTheDocument();
        expect(screen.getByText('Date: 30.11.2023')).toBeInTheDocument();
    });

    test('filters events correctly', async () => {
        render(<EventCard isLeader={true}/>);
        await waitFor(() => expect(fetchEvents).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading events...')).not.toBeInTheDocument());

        fireEvent.click(screen.getByText('Accepted'));
        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.queryByText('Event 2')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Declined'));
        expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    test('handles RSVP updates correctly', async () => {
        updateRSVP.mockResolvedValue({});
        render(<EventCard isLeader={true}/>);
        await waitFor(() => expect(fetchEvents).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading events...')).not.toBeInTheDocument());

        fireEvent.click(screen.getByText('Accept'));
        await waitFor(() => expect(updateRSVP).toHaveBeenCalledTimes(1));
        expect(screen.getByText('Joined')).toBeInTheDocument();
    });
});
