<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Calendar } from '$lib/components/ui/calendar';
	import {
		CloudUpload,
		Link,
		Calendar as CalendarIcon,
		Loader2,
		MapPin,
		Clock,
		Copy
	} from '@lucide/svelte';
	import ICAL from 'ical.js';
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
	import { toast } from 'svelte-sonner';

	let events = $state<any[]>([]);
	let selectedDate = $state<DateValue | undefined>(today(getLocalTimeZone()));
	let isLoading = $state(false);
	let parsedEvents = $state<any[]>([]);

	// Helper to format time
	function formatTime(date: Date) {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function getEventClipboardString(event: any) {
		const date = event.startDate;
		const dateString = date.toLocaleString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});

		const offset = -date.getTimezoneOffset() / 60;
		const offsetString = offset >= 0 ? `+ ${offset}` : `- ${Math.abs(offset)}`;

		return `${event.summary}\n${dateString} UTC ${offsetString}`;
	}

	function copyEventToClipboard(event: any) {
		const text = getEventClipboardString(event);
		navigator.clipboard.writeText(text);
		toast.success('Event details copied to clipboard!');
	}

	function copyAllEvents() {
		if (filteredEvents.length === 0) return;
		const text = filteredEvents.map(getEventClipboardString).join('\n-----------\n\n');
		navigator.clipboard.writeText(text);
		toast.success('All events copied to clipboard!');
	}

	function parseICS(content: string) {
		try {
			const jcalData = ICAL.parse(content);
			const comp = new ICAL.Component(jcalData);
			const vevents = comp.getAllSubcomponents('vevent');

			parsedEvents = vevents.map((vevent) => {
				const event = new ICAL.Event(vevent);
				return {
					summary: event.summary,
					startDate: event.startDate.toJSDate(),
					endDate: event.endDate.toJSDate(),
					description: event.description,
					location: event.location
				};
			});

			events = parsedEvents;
			toast.success(`Successfully parsed ${events.length} events!`);
		} catch (e) {
			console.error('Error parsing ICS:', e);
			toast.error('Failed to parse ICS file.');
		}
	}

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isLoading = true;
		try {
			const text = await file.text();
			parseICS(text);
		} catch (e) {
			toast.error('Error reading file.');
		} finally {
			isLoading = false;
		}
	}

	async function handleUrlFetch(e: SubmitEvent) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const urlInput = form.elements.namedItem('url') as HTMLInputElement;
		const url = urlInput.value;

		if (!url) return;

		isLoading = true;
		try {
			const res = await fetch(`/api/fetch-ics?url=${encodeURIComponent(url)}`);
			if (!res.ok) throw new Error('Fetch failed');
			const text = await res.text();
			parseICS(text);
		} catch (e) {
			console.error(e);
			toast.error('Failed to fetch calendar from URL.');
		} finally {
			isLoading = false;
		}
	}

	let filteredEvents = $derived(
		parsedEvents.filter((event) => {
			if (!selectedDate) return false;
			const eventDate = event.startDate;
			return (
				eventDate.getDate() === selectedDate.day &&
				eventDate.getMonth() + 1 === selectedDate.month &&
				eventDate.getFullYear() === selectedDate.year
			);
		})
	);
</script>

<svelte:head>
	<title>Dewdrop Dates</title>
	<meta name="description" content="Your friendly meeting dates helper." />
</svelte:head>

<div
	class="min-h-screen flex flex-col items-center justify-center p-6 text-foreground transition-colors duration-300 gap-8"
>
	<div class="w-full max-w-5xl space-y-8">
		<!-- Header Section -->

		<div
			class="mx-auto w-fit max-w-full text-center space-y-2 bg-background/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm"
		>
			<h1 class="text-4xl font-bold tracking-tight text-primary">Dewdrop Dates</h1>
			<p class="text-muted-foreground text-lg">Your friendly meeting dates helper.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
			<!-- Left Column: Controls & Calendar -->
			<div class="md:col-span-4 space-y-6">
				<!-- Import Card -->
				<Card.Root class="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
					<Card.Header>
						<Card.Title class="text-xl">Import Calendar</Card.Title>
						<Card.Description>Load your ICS file.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Tabs.Root value="upload" class="w-full">
							<Tabs.List class="grid w-full grid-cols-2 mb-6">
								<Tabs.Trigger value="upload" class="flex items-center gap-2">
									<CloudUpload class="w-4 h-4" />
									Upload
								</Tabs.Trigger>
								<Tabs.Trigger value="url" class="flex items-center gap-2">
									<Link class="w-4 h-4" />
									URL
								</Tabs.Trigger>
							</Tabs.List>

							<Tabs.Content value="upload">
								<div class="grid w-full items-center gap-4">
									<div class="grid w-full items-center gap-2">
										<Label for="file">ICS File</Label>
										<div class="flex items-center justify-center w-full">
											<label
												for="file"
												class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted border-border hover:border-primary/50 transition-all"
											>
												<div class="flex flex-col items-center justify-center pt-5 pb-6">
													{#if isLoading}
														<Loader2 class="w-8 h-8 mb-3 text-primary animate-spin" />
														<p class="text-sm text-muted-foreground">Parsing...</p>
													{:else}
														<CloudUpload class="w-8 h-8 mb-3 text-muted-foreground" />
														<p class="text-sm text-muted-foreground">
															<span class="font-semibold">Click to upload</span>
														</p>
														<p class="text-xs text-muted-foreground">ICS files only</p>
													{/if}
												</div>
												<Input
													id="file"
													type="file"
													accept=".ics"
													class="hidden"
													onchange={handleFileUpload}
													disabled={isLoading}
												/>
											</label>
										</div>
									</div>
								</div>
							</Tabs.Content>

							<Tabs.Content value="url">
								<form onsubmit={handleUrlFetch} class="grid w-full items-center gap-4">
									<div class="grid w-full items-center gap-2">
										<Label for="url">Calendar URL</Label>
										<Input
											id="url"
											name="url"
											type="url"
											placeholder="https://example.com/calendar.ics"
											class="h-11"
											disabled={isLoading}
										/>
									</div>
									<Button type="submit" class="w-full font-semibold" disabled={isLoading}>
										{#if isLoading}
											<Loader2 class="w-4 h-4 mr-2 animate-spin" />
											Fetching...
										{:else}
											Fetch & Parse
										{/if}
									</Button>
								</form>
							</Tabs.Content>
						</Tabs.Root>
					</Card.Content>
				</Card.Root>

				<!-- Calendar Widget -->
				<Card.Root class="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
					<Card.Header>
						<Card.Title class="text-xl">Filter by Date</Card.Title>
					</Card.Header>
					<Card.Content class="flex justify-center">
						<Calendar type="single" bind:value={selectedDate} class="rounded-md border" />
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Right Column: Events List -->
			<div class="md:col-span-8">
				<Card.Root
					class="border-border/50 shadow-xl backdrop-blur-sm bg-card/80 h-[60vh] md:h-[600px] flex flex-col"
				>
					<Card.Header>
						<Card.Title class="text-2xl flex items-center gap-2">
							Events for {selectedDate ? selectedDate.toString() : 'Selected Date'}
							<div class="ml-auto flex items-center gap-2">
								{#if filteredEvents.length > 0}
									<Button variant="outline" size="sm" onclick={copyAllEvents} class="gap-2 h-8">
										<Copy class="w-3.5 h-3.5" />
										Copy All
									</Button>
								{/if}
								<span
									class="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full h-8 flex items-center"
								>
									{filteredEvents.length} events
								</span>
							</div>
						</Card.Title>
					</Card.Header>
					<Card.Content class="flex-1 overflow-y-auto pr-2">
						{#if filteredEvents.length === 0}
							<div class="flex flex-col items-center justify-center h-64 text-muted-foreground">
								<CalendarIcon class="w-12 h-12 mb-4 opacity-20" />
								<p class="text-lg">No events found for this day.</p>
								{#if parsedEvents.length === 0}
									<p class="text-sm opacity-70">Upload an ICS file to get started.</p>
								{/if}
							</div>
						{:else}
							<div class="space-y-4">
								{#each filteredEvents as event}
									<div
										class="flex flex-col p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-all hover:shadow-md"
									>
										<div class="flex items-start justify-between gap-4">
											<h3 class="font-semibold text-lg text-primary">{event.summary}</h3>
											<div class="flex items-center gap-2">
												<div
													class="flex items-center text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded"
												>
													<Clock class="w-3 h-3 mr-1.5" />
													{formatTime(event.startDate)} - {formatTime(event.endDate)}
												</div>
												<Button
													variant="ghost"
													size="icon"
													class="h-7 w-7"
													onclick={() => copyEventToClipboard(event)}
													title="Copy event details"
												>
													<Copy class="w-3.5 h-3.5" />
												</Button>
											</div>
										</div>

										{#if event.location}
											<div class="flex items-center text-sm text-muted-foreground mt-2">
												<MapPin class="w-3.5 h-3.5 mr-1.5" />
												{event.location}
											</div>
										{/if}

										{#if event.description}
											<p
												class="text-sm text-muted-foreground mt-3 whitespace-pre-wrap break-all border-t border-border/50 pt-2"
											>
												{event.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>
