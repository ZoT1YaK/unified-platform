import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TaskCard from '../../components/TaskCard/TaskCard';
import {fetchEmployeeTasks, toggleTaskStatus} from '../../services/taskService';

jest.mock('../../services/taskService');

const mockTasks = [
    {_id: '1', title: 'Task 1', status: 'Pending', description: 'Description 1', deadline: '2023-12-31'},
    {_id: '2', title: 'Task 2', status: 'Completed', description: 'Description 2', deadline: '2023-12-31'},
];

describe('TaskCard Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
        fetchEmployeeTasks.mockResolvedValue(mockTasks);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders task card correctly', async () => {
        render(<TaskCard/>);
        await waitFor(() => expect(screen.getByText('Your Tasks')).toBeInTheDocument());
        expect(screen.getByPlaceholderText('Search for a task...')).toBeInTheDocument();
    });

    test('fetches and displays tasks', async () => {
        render(<TaskCard/>);
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });

    test('filters tasks based on search query', async () => {
        render(<TaskCard/>);
        await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Search for a task...'), {target: {value: 'Task 2'}});
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    test('toggles task status', async () => {
        toggleTaskStatus.mockResolvedValue();
        render(<TaskCard/>);
        await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

        const taskCheckbox = screen.getByText('Task 1').closest('.task-header').querySelector('.task-checkbox');
        fireEvent.click(taskCheckbox);

        await waitFor(() => expect(toggleTaskStatus).toHaveBeenCalledWith('mock-token', '1', 'Completed'));
    });

    test('handles errors when fetching tasks', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        fetchEmployeeTasks.mockRejectedValue(new Error('Failed to fetch tasks'));
        render(<TaskCard/>);
        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error fetching tasks:', 'Failed to fetch tasks'));
        consoleErrorMock.mockRestore();
    });

    test('handles errors when toggling task status', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        toggleTaskStatus.mockRejectedValue(new Error('Failed to update task status'));
        render(<TaskCard/>);
        await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

        const taskCheckbox = screen.getByText('Task 1').previousSibling;
        fireEvent.click(taskCheckbox);

        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error toggling task status:', 'Failed to update task status'));
        consoleErrorMock.mockRestore();
    });
});
