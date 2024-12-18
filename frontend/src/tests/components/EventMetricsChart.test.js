import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {fetchEventMetrics} from '../../services/metricsService';
import EventMetricsChart from '../../components/LeaderHub/EventMetricsChart';

jest.mock('../../services/metricsService');

describe('EventMetricsChart Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders loading state initially', () => {
        fetchEventMetrics.mockResolvedValueOnce(null);
        render(<EventMetricsChart/>);
        expect(screen.getByText('Loading event metrics...')).toBeInTheDocument();
    });

    test('renders error state when fetching metrics fails', async () => {
        fetchEventMetrics.mockRejectedValueOnce(new Error('Failed to fetch event metrics.'));
        render(<EventMetricsChart/>);
        await waitFor(() => expect(screen.getByText('Failed to fetch event metrics.')).toBeInTheDocument());
    });
});
