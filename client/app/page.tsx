'use client'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Table } from "@chakra-ui/react"
import './globals.css'

export default function Home() {

  const statuses = ['available', 'aog', 'maintenance'];

  const [aircraft, setAircraft] = useState()
  const [statusInput, setStatusInput] = useState('All Status')
  const [modelInput, setModelInput] = useState('')
  const [tailInput, setTailInput] = useState('')

  const onStatusChange = (e) => {
    setStatusInput(e.target.value)
  }

  useEffect(() => {
    fetchAircraft();
  }, []);

  const fetchAircraft = async () => {
    const { data, error } = await supabase
    .from('aircraft')
    .select('*');

    if (error) {
      console.error('Error fetching aircraft:', error);
    } else {
      setAircraft(data);
    }
  };

  const filterAircraft = async (statusInput, modelInput, tailInput) => {
    let query = supabase.from('aircraft').select('*');

    // Apply filters only if values are provided
    if (statusInput != 'All Status') {
      query = query.eq('status', statusInput);
    }
    if (modelInput) {
      query = query.ilike('model', `%${modelInput}%`); // partial, case-insensitive match
    }
    if (tailInput) {
      query = query.ilike('tail_number', `%${tailInput}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching aircraft:', error);
    } else {
      setAircraft(data);
    }
  };

  const editStatus = async (id, status) => {
    const { data, error } = await supabase
      .from("aircraft")
      .update({ status: status })
      .eq("id", id);

    if (error) {
      console.log("error toggling task: ", error);
    } else {
      const updatedAircraft = aircraft.map((plane) =>
        plane.id === id ? { ...plane, status: status } : plane
      );
      setAircraft(updatedAircraft);
    }
  }

  
  return (
    <div>
      <section id="heading-section">
        <h1>Gander Aircraft Records</h1>
        <div id='input-container' className="flex flex-row">
          <div>
            <h2>Tail Number Filter</h2>
            <input className="search" type="search" placeholder="Tail Number..." value={tailInput} onChange={((e) => setTailInput(e.target.value))} />
          </div>
          <div>
            <h2>Model Filter</h2>
            <input className="search" type="search" placeholder="Model..." value={modelInput} onChange={((e) => setModelInput(e.target.value))} />
          </div>
          <div className="flex flex-col">
            <h2>Status Filter</h2>
            <label>
                <input name="statusFilter" type="radio" value="All Status" checked={statusInput === "All Status"} onChange={onStatusChange} />
                All Status
              </label>
            {statuses.map((planeStatus, id) => (
              <label>
                <input name="statusFilter" type="radio" value={planeStatus} checked={statusInput === planeStatus} key={id} onChange={onStatusChange} />
                {planeStatus}
              </label>
            ))}
          </div>
          <button onClick={((e) => filterAircraft(statusInput, modelInput, tailInput))}>Filter</button>
          <button onClick={((e) => filterAircraft("All Status", "", ""))}>Reset Filter</button>
        </div>
      </section>
      <Table.Root size="sm" striped>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tail Number</Table.ColumnHeader>
            <Table.ColumnHeader>Model</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Current Location</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {aircraft?.map((plane) => (
            <Table.Row key={plane.id}>
              <Table.Cell>{plane.tail_number}</Table.Cell>
              <Table.Cell>{plane.model}</Table.Cell>
              <Table.Cell>
                <select
                  defaultValue={plane.status}
                  onChange={(e) => editStatus(plane.id, e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Table.Cell>
              <Table.Cell>{plane.location?.lat ?? '—'}, {plane.location?.lng ?? '—'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
