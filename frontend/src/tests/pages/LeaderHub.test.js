import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import LeaderHub from '../../components/LeaderHub/LeaderHub';

describe('LeaderHub Component', () => {
    beforeEach(() => {
        localStorage.setItem('employee', JSON.stringify({
            is_people_leader: true,
        }));
        render(
            <Router>
                <LeaderHub/>
            </Router>
        );
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders LeaderHub component and its elements', async () => {
        const createTaskElements = screen.getAllByText('Create a Task');
        expect(createTaskElements.length).toBeGreaterThan(0);
        const createEventElements = screen.getAllByText('Create an Event');
        expect(createEventElements.length).toBeGreaterThan(0);
        await waitFor(() => expect(screen.getByText('Scheduled Events')).toBeInTheDocument());
        expect(screen.getByText('Get and View Metrics Reports')).toBeInTheDocument();
    });
});
