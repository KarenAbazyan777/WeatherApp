import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Context from '../../context';
import UserInfo from '../../state/UserInfo';
import PlaceStore from '../../state/placeStore';
import MyAccount from './MyAccount';

const renderPage = () => render(
    <Context.Provider value={{ userinfo: new UserInfo(), placeStore: new PlaceStore() }}>
        <MemoryRouter>
            <MyAccount />
        </MemoryRouter>
    </Context.Provider>
);

beforeEach(() => {
    jest.useFakeTimers();
    localStorage.setItem('token', 'test-token');
});

afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    delete global.fetch;
});

test('sleeping server: explains the wait after 4 s, gives up with "Try again" after 75 s', async () => {
    // A request that never answers, but stops when aborted (like a real fetch)
    global.fetch = jest.fn((url, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }));

    renderPage();
    expect(screen.queryByText(/Waking up the server/)).toBeNull();

    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByText(/Waking up the server/)).toBeTruthy();

    // async act: also lets the aborted request's .catch/.finally run and React re-render
    await act(async () => { jest.advanceTimersByTime(71000); });
    expect(screen.getByText('The server did not answer in time')).toBeTruthy();

    // "Try again" sends the request again
    fireEvent.click(screen.getByText('Try again'));
    expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('awake server: shows the account, no waiting message', async () => {
    jest.useRealTimers();
    global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'Karen', userlname: 'A', useremail: 'k@a.com', places: ['YEREVAN,AM'] }),
    }));

    renderPage();
    expect(await screen.findByText('Karen A')).toBeTruthy();
    expect(screen.getByText('YEREVAN,AM')).toBeTruthy();
    expect(screen.queryByText(/Waking up the server/)).toBeNull();
});
