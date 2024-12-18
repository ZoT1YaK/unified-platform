import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EventCreator from '../../components/EventCreator/EventCreator';
import {fetchEmployees} from '../../services/employeeService';
import {createEvent, fetchEventResources} from '../../services/eventService';
import {fetchActiveBadges} from '../../services/badgeService';

jest.mock('../../services/employeeService');
jest.mock('../../services/eventService');
jest.mock('../../services/badgeService');

const mockEmployees = [
    {_id: '1', f_name: 'John', l_name: 'Doe', email: 'john.doe@example.com'},
    {_id: '2', f_name: 'Jane', l_name: 'Smith', email: 'jane.smith@example.com'},
];

const mockBadges = [
    {_id: '1', name: 'Badge 1'},
    {_id: '2', name: 'Badge 2'},
];

const mockResources = {
    departments: [{_id: '1', name: 'HR'}, {_id: '2', name: 'Engineering'}],
    teams: [{_id: '1', name: 'Team A'}, {_id: '2', name: 'Team B'}],
    locations: ['New York', 'San Francisco'],
};

describe('EventCreator Component', () => {
    beforeEach(() => {
        fetchEmployees.mockResolvedValue(mockEmployees);
        fetchActiveBadges.mockResolvedValue(mockBadges);
        fetchEventResources.mockResolvedValue(mockResources);
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('employee', JSON.stringify({_id: '1'}));
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<EventCreator onSave={jest.fn()}/>);
    });

    test('populates form data when editing an existing event', async () => {
        const existingEvent = {
            title: 'Existing Event',
            description: 'This is an existing event',
            date: '2023-12-31',
            time: '10:00',
            location: 'New York',
            target_departments: ['1'],
            target_teams: ['1'],
            target_locations: ['New York'],
            target_employees: ['2'],
            badge_id: '1',
        };

        render(<EventCreator onSave={jest.fn()} existingEvent={existingEvent}/>);
        await waitFor(() => expect(screen.getByDisplayValue('Existing Event')).toBeInTheDocument());
        expect(screen.getByDisplayValue('This is an existing event')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2023-12-31')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
    });

    test('handles form submission correctly', async () => {
        const newEvent = {
            _id: '1',
            title: 'New Event',
            description: 'Event description',
            date: '2023-12-31',
            time: '10:00',
            location: 'New York',
            target_departments: [],
            target_teams: [],
            target_locations: [],
            target_employees: [],
            badge_id: '',
        };

        createEvent.mockResolvedValue(newEvent);

        const onSave = jest.fn();
        render(<EventCreator onSave={onSave}/>);

        fireEvent.change(screen.getByPlaceholderText('Enter event name'), {target: {value: 'New Event'}});
        fireEvent.change(screen.getByPlaceholderText('Add a description'), {target: {value: 'Event description'}});
        fireEvent.change(screen.getByLabelText('Date *'), {target: {value: '2023-12-31'}});
        fireEvent.change(screen.getByLabelText('Time'), {target: {value: '10:00'}});
        fireEvent.click(screen.getByText('Create Event'));

        await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({title: 'New Event'})));
    });
});
