import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {fetchActiveBadges} from '../../services/badgeService';
import {fetchEmployees} from '../../services/employeeService';
import {createTask} from '../../services/taskService';
import TaskCreator from "../../components/TaskCreation/TaskCreation";

jest.mock('../../services/badgeService');
jest.mock('../../services/employeeService');
jest.mock('../../services/taskService');

const mockBadges = [
    {_id: '1', name: 'Badge 1'},
    {_id: '2', name: 'Badge 2'},
];

const mockEmployees = [
    {_id: '1', f_name: 'John', l_name: 'Doe', email: 'john.doe@example.com'},
    {_id: '2', f_name: 'Jane', l_name: 'Doe', email: 'jane.doe@example.com'},
];

describe('TaskCreator Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('employee', JSON.stringify({_id: '1'}));
        fetchActiveBadges.mockResolvedValue(mockBadges);
        fetchEmployees.mockResolvedValue(mockEmployees);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders task creator form correctly', async () => {
        render(<TaskCreator/>);
        await waitFor(() => expect(screen.getByText('Title')).toBeInTheDocument());
        expect(screen.getByPlaceholderText('Enter a name for your task')).toBeInTheDocument();
    });

    test('fetches and displays badges and employees', async () => {
        render(<TaskCreator/>);
        await waitFor(() => {
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Jane Doe (jane.doe@example.com)')).toBeInTheDocument();
        });
    });

    test('handles input changes', async () => {
        render(<TaskCreator/>);
        await waitFor(() => expect(screen.getByPlaceholderText('Enter a name for your task')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Enter a name for your task'), {target: {value: 'New Task'}});
        expect(screen.getByPlaceholderText('Enter a name for your task')).toHaveValue('New Task');
    });

    test('submits the form and creates a task', async () => {
        createTask.mockResolvedValue();
        render(<TaskCreator/>);
        await waitFor(() => expect(screen.getByPlaceholderText('Enter a name for your task')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Enter a name for your task'), {target: {value: 'New Task'}});
        fireEvent.change(screen.getByLabelText('Assigned To *'), {target: {value: 'jane.doe@example.com'}});
        fireEvent.change(screen.getByLabelText('Attach a badge'), {target: {value: 'Badge 1'}});
        fireEvent.change(screen.getByPlaceholderText('Enter details about your task'), {target: {value: 'Task description'}});
        fireEvent.change(screen.getByLabelText('Deadline'), {target: {value: '2023-12-31'}});

        fireEvent.click(screen.getByText('Add Task'));

        await waitFor(() => expect(createTask).toHaveBeenCalledWith('mock-token', {
            title: 'New Task',
            description: 'Task description',
            deadline: '2023-12-31',
            badge_id: null,
            assigned_to_id: null,
            type: 'Leader-Assigned'
        }));
    });

    test('handles errors when fetching data', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        fetchActiveBadges.mockRejectedValue(new Error('Failed to fetch badges'));
        render(<TaskCreator/>);
        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error fetching data:', 'Failed to fetch badges'));
        consoleErrorMock.mockRestore();
    });

    test('handles errors when creating a task', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        createTask.mockRejectedValue(new Error('Failed to create task'));
        render(<TaskCreator/>);
        await waitFor(() => expect(screen.getByPlaceholderText('Enter a name for your task')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Enter a name for your task'), {target: {value: 'New Task'}});
        fireEvent.change(screen.getByLabelText('Assigned To *'), {target: {value: 'jane.doe@example.com'}});
        fireEvent.change(screen.getByLabelText('Attach a badge'), {target: {value: 'Badge 1'}});
        fireEvent.change(screen.getByPlaceholderText('Enter details about your task'), {target: {value: 'Task description'}});
        fireEvent.change(screen.getByLabelText('Deadline'), {target: {value: '2023-12-31'}});

        fireEvent.click(screen.getByText('Add Task'));

        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error creating task:', 'Failed to create task'));
        consoleErrorMock.mockRestore();
    });
});
