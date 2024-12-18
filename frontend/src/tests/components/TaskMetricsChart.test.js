import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import TaskMetricsChart from '../../components/LeaderHub/TaskMetricsChart';
import {fetchTaskMetrics} from '../../services/metricsService';

jest.mock('../../services/metricsService');

describe('TaskMetricsChart Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders loading state initially', () => {
        fetchTaskMetrics.mockResolvedValueOnce([]);
        render(<TaskMetricsChart/>);
        expect(screen.getByText('Loading task metrics...')).toBeInTheDocument();
    });

    test('renders error state when fetching metrics fails', async () => {
        fetchTaskMetrics.mockRejectedValueOnce(new Error('Failed to fetch task metrics.'));
        render(<TaskMetricsChart/>);
        await waitFor(() => expect(screen.getByText('Failed to fetch task metrics. Please try again.')).toBeInTheDocument());
    });

    test('renders task metrics correctly', async () => {
        fetchTaskMetrics.mockResolvedValueOnce([
            {_id: '1', name: 'Task 1', count: 3},
            {_id: '2', name: 'Task 2', count: 5},
        ]);
        render(<TaskMetricsChart/>);
        await waitFor(() => expect(screen.queryByText('Loading task metrics...')).not.toBeInTheDocument());

        expect(screen.getByText('Task Metrics Breakdown')).toBeInTheDocument();
    });
});
