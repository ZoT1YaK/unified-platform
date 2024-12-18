import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import {fetchDataMindType} from '../../services/employeeService';
import {fetchPosts} from '../../services/postService';
import {getStoredEmployee, getToken} from '../../services/authService';
import Home from "../../components/Home(explore)/Home";

jest.mock('../../services/employeeService');
jest.mock('../../services/postService');
jest.mock('../../services/authService');

describe('Home Component', () => {
    beforeEach(() => {
        getStoredEmployee.mockReturnValue({
            _id: '1',
            f_name: 'John',
            l_name: 'Doe',
            img_link: '/avatar.png',
            position: 'Developer',
            dep_id: {name: 'Engineering'},
            location: 'New York',
        });
        getToken.mockReturnValue('token');
        fetchDataMindType.mockResolvedValue({
            datamind_id: {data_mind_type: 'TypeA'},
        });
        fetchPosts.mockResolvedValue([
            {_id: '1', content: 'Post 1', timestamp: '2023-01-01', author: {img_link: '/post1.png'}},
            {_id: '2', content: 'Post 2', timestamp: '2023-01-02', author: {img_link: '/post2.png'}},
        ]);
    });

    test('renders loading state initially', () => {
        render(<Home/>);
        expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });

    test('renders user profile information', async () => {
        render(
            <Router>
                <Home/>
            </Router>
        );
        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
        expect(screen.getByText('Developer | Engineering')).toBeInTheDocument();
        expect(screen.getByText('New York')).toBeInTheDocument();
        expect(screen.getByText('I am #TypeADatamind')).toBeInTheDocument();
    });

    test('renders posts after loading', async () => {
        render(
            <Router>
                <Home/>
            </Router>
        );
        await waitFor(() => expect(screen.getByText('Post 1')).toBeInTheDocument());
        expect(screen.getByText('Post 2')).toBeInTheDocument();
    });

    test('filters posts based on search term', async () => {
        render(
            <Router>
                <Home/>
            </Router>
        );
        await waitFor(() => expect(screen.getByText('Post 1')).toBeInTheDocument());
        fireEvent.change(screen.getByPlaceholderText('Search for a post...'), {target: {value: 'Post 2'}});
        expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
        expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
});
