import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EmployeeDetails from '../../components/EmployeeDetails/EmployeeDetails';
import {fetchEmployeeProfile} from '../../services/employeeService';

jest.mock('../../services/employeeService');

const mockProfile = {
    f_name: 'John',
    l_name: 'Doe',
    position: 'Developer',
    dep_id: {name: 'Engineering'},
    location: 'New York',
    img_link: '/john-doe.png',
    datamind: 'Analytical'
};

describe('EmployeeDetails Component', () => {
    beforeEach(() => {
        fetchEmployeeProfile.mockResolvedValue(mockProfile);
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('employee', JSON.stringify({data_mind_type: 'Analytical'}));
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<EmployeeDetails empId="123"/>);
    });

    test('displays loading state initially', () => {
        render(<EmployeeDetails empId="123"/>);
        expect(screen.getByText('Loading employee details...')).toBeInTheDocument();
    });

    test('displays user details loading', async () => {
        render(<EmployeeDetails empId="123"/>);
        await waitFor(() => expect(fetchEmployeeProfile).toHaveBeenCalledTimes(1));

        expect(screen.queryByText('Loading employee details...')).toBeInTheDocument();
    });

    test('displays user details correctly', async () => {
        render(<EmployeeDetails empId="123"/>);
        await waitFor(() => expect(fetchEmployeeProfile).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading employee details...')).not.toBeInTheDocument());

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Developer | Engineering')).toBeInTheDocument();
        expect(screen.getByText('New York')).toBeInTheDocument();
        expect(screen.getByAltText('User Avatar')).toHaveAttribute('src', '/john-doe.png');
    });
});
