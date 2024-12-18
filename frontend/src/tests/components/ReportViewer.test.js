import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import ReportViewer from '../../components/LeaderHub/ReportViewer';
import {fetchReports} from '../../services/metricsService';

jest.mock('../../services/metricsService');

describe('ReportViewer Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders loading state initially', async () => {
        fetchReports.mockResolvedValueOnce([]);
        render(<ReportViewer/>);
        expect(screen.getByText('View Report')).toBeInTheDocument();
    });

    test('renders reports correctly after loading', async () => {
        fetchReports.mockResolvedValueOnce([
            {reportId: '1', reportDate: '2023-12-31'},
            {reportId: '2', reportDate: '2023-11-30'},
        ]);
        render(<ReportViewer/>);
        await waitFor(() => expect(fetchReports).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByText('Loading reports...')).not.toBeInTheDocument());

        await waitFor(() => expect(screen.getByText('31.12.2023')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('30.11.2023')).toBeInTheDocument());
    });
});
