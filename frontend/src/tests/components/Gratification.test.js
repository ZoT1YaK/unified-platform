import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Gratification from '../../components/Gratification/Gratification';
import {fetchBadges} from '../../services/badgeService';
import {uploadDatamind} from '../../services/datamindService';

jest.mock('../../services/badgeService');
jest.mock('../../services/datamindService');

const mockBadges = {
    activeBadges: [
        {_id: '1', name: 'Badge 1'},
        {_id: '2', name: 'Badge 2'},
    ],
    archivedBadges: [
        {_id: '3', name: 'Badge 3'},
        {_id: '4', name: 'Badge 4'},
    ],
};

describe('Gratification Component', () => {
    beforeEach(() => {
        fetchBadges.mockResolvedValue(mockBadges);
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<Gratification onClose={jest.fn()}/>);
    });

    test('fetches and displays badges correctly', async () => {
        render(<Gratification onClose={jest.fn()}/>);
        await waitFor(() => expect(fetchBadges).toHaveBeenCalledTimes(1));

        await waitFor(() => {
            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
            expect(screen.getByText('Badge 3')).toBeInTheDocument();
            expect(screen.getByText('Badge 4')).toBeInTheDocument();
        });
    });

    test('handles Datamind file upload correctly', async () => {
        const file = new File(['datamind data'], 'datamind.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        uploadDatamind.mockResolvedValue({message: 'Datamind uploaded successfully'});

        render(<Gratification onClose={jest.fn()}/>);
        const uploadButton = screen.getByText('Upload Datamind');
        const input = uploadButton.previousElementSibling;

        fireEvent.change(input, {target: {files: [file]}});
        fireEvent.click(uploadButton);

        await waitFor(() => expect(uploadDatamind).toHaveBeenCalledTimes(1));
        await waitFor(() => {
            const messages = screen.getAllByText((content, element) => content.includes('Datamind uploaded successfully'));
            expect(messages.length).toBeGreaterThan(0);
        });
    });
});
