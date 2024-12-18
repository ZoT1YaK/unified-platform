import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EmployeeTasks from '../../components/EmployeeTasks/EmployeeTasks';
import {fetchEmployeeTasks} from '../../services/taskService';

jest.mock('../../services/taskService');

const mockTasks = [
    {_id: '1', title: 'Task 1', status: 'Completed', type: 'Self-Created', deadline: '2023-12-31'},
    {_id: '2', title: 'Task 2', status: 'Pending', type: 'Assigned', deadline: '2023-11-30'},
];

describe('EmployeeTasks Component', () => {
    beforeEach(() => {
        fetchEmployeeTasks.mockResolvedValue(mockTasks);
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<EmployeeTasks/>);
    });

    test('displays loading state initially', () => {
        render(<EmployeeTasks/>);
        expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });

    test('displays tasks correctly after loading', async () => {
        render(<EmployeeTasks/>);
        await waitFor(() => expect(fetchEmployeeTasks).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('31.12.2023')).toBeInTheDocument();
        expect(screen.getByText('30.11.2023')).toBeInTheDocument();
    });

    test('opens modal when add task button is clicked', async () => {
        render(<EmployeeTasks/>);
        await waitFor(() => expect(fetchEmployeeTasks).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument());

        fireEvent.click(screen.getByAltText('Add'));
        const addTaskElements = screen.getAllByText('Add Task');
        expect(addTaskElements).toHaveLength(2);
        expect(addTaskElements[0]).toBeInTheDocument();
    });
});
