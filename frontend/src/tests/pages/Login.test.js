import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import Login from '../../components/Login/Login';
import {loginEmployee} from '../../services/employeeService';

jest.mock('../../services/employeeService');

describe('Login Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders login form', () => {
        render(<Login/>);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('Log In')).toBeInTheDocument();
    });

    test('displays error message on failed login', async () => {
        loginEmployee.mockRejectedValueOnce({
            response: {data: {message: 'Invalid credentials'}}
        });

        render(<Login/>);
        fireEvent.change(screen.getByPlaceholderText('Email'), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByPlaceholderText('Password'), {target: {value: 'wrongpassword'}});
        fireEvent.click(screen.getByText('Log In'));

        await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
    });

    test('displays success message on successful login', async () => {
        loginEmployee.mockResolvedValueOnce({
            token: 'test-token',
            employee: {id: 1, name: 'John Doe'}
        });

        render(<Login/>);
        fireEvent.change(screen.getByPlaceholderText('Email'), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByPlaceholderText('Password'), {target: {value: 'correctpassword'}});
        fireEvent.click(screen.getByText('Log In'));

        await waitFor(() => expect(screen.getByText('Login successful!')).toBeInTheDocument());
        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('employee')).toBe(JSON.stringify({id: 1, name: 'John Doe'}));
    });
});
