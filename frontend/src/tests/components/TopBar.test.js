import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {BrowserRouter as Router} from 'react-router-dom';
import TopBar from '../../components/TopBar/TopBar';
import {fetchEmployees} from '../../services/employeeService';

jest.mock('../../services/employeeService');

const mockEmployees = [
    {_id: '1', f_name: 'John', l_name: 'Doe', email: 'john.doe@example.com'},
    {_id: '2', f_name: 'Jane', l_name: 'Doe', email: 'jane.doe@example.com'},
];

describe('TopBar Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('employee', JSON.stringify({_id: '1', is_people_leader: true}));
        fetchEmployees.mockResolvedValue(mockEmployees);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders top bar correctly', async () => {
        render(
            <Router>
                <TopBar/>
            </Router>
        );
        await waitFor(() => expect(screen.getByPlaceholderText('Search employees...')).toBeInTheDocument());
    });

    test('fetches and displays employees', async () => {
        render(
            <Router>
                <TopBar/>
            </Router>
        );
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText('Search employees...'), {target: {value: 'John'}});
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    test('toggles dropdown menu', async () => {
        render(
            <Router>
                <TopBar/>
            </Router>
        );
        const userAvatars = screen.getAllByAltText('User Avatar');
        fireEvent.click(userAvatars[0]);
        await waitFor(() => expect(screen.getByText('View Profile')).toBeInTheDocument());
        fireEvent.click(userAvatars[0]);
        await waitFor(() => expect(screen.queryByText('View Profile')).not.toBeInTheDocument());
    });

    test('handles logout', async () => {
        render(
            <Router>
                <TopBar/>
            </Router>
        );
        fireEvent.click(screen.getByAltText('User Avatar'));
        await waitFor(() => expect(screen.getByText('Log Out')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Log Out'));
        await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
    });
});
