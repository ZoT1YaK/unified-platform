import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Achievements from '../../components/Achievements/Achievements';
import {fetchAchievements} from '../../services/achievementService';

jest.mock('../../services/achievementService');

describe('Achievements Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mockToken');
        localStorage.setItem('employee', JSON.stringify({_id: 'mockEmpId'}));
    });

    test('displays no achievements message when none are available', async () => {
        fetchAchievements.mockResolvedValue([]);

        render(<Achievements empId="mockEmpId"/>);

        await waitFor(() => expect(fetchAchievements).toHaveBeenCalled());

        expect(screen.getByText('No achievements found.')).toBeInTheDocument();
    });
});
