import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {fetchDatamindOptions, updateEmployeeDatamind} from "../../services/datamindService";
import {fetchDataMindType} from "../../services/employeeService";
import Datamind from "../../components/Datamind/Datamind";

jest.mock('../../services/datamindService');
jest.mock('../../services/employeeService');

describe('Datamind Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => 'fake-token'),
                setItem: jest.fn(),
            },
            writable: true
        });
    });

    test('renders Datamind component', async () => {
        fetchDatamindOptions.mockResolvedValue([
            {_id: '1', data_mind_type: 'Type1'},
            {_id: '2', data_mind_type: 'Type2'},
        ]);
        fetchDataMindType.mockResolvedValue({datamind_id: {_id: '1'}});

        render(<Datamind/>);

        await waitFor(() => {
            expect(screen.getByText('#IAmType1Datamind')).toBeInTheDocument();
        });
    });

    test('handles Datamind change', async () => {
        fetchDatamindOptions.mockResolvedValue([
            {_id: '1', data_mind_type: 'Type1'},
            {_id: '2', data_mind_type: 'Type2'},
        ]);
        fetchDataMindType.mockResolvedValue({datamind_id: {_id: '1'}});
        updateEmployeeDatamind.mockResolvedValue({});

        render(<Datamind/>);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByRole('combobox'), {target: {value: '2'}});

        await waitFor(() => {
            expect(updateEmployeeDatamind).toHaveBeenCalled();
        });
    });

    test('handles error when fetching Datamind data', async () => {
        fetchDatamindOptions.mockRejectedValue(new Error('Fetch error'));

        render(<Datamind/>);

        await waitFor(() => {
            expect(screen.getByText('Error fetching Datamind data. Please try again later.')).toBeInTheDocument();
        });
    });
});
