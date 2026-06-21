const GA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

export interface GAMetric {
  name: string;
  value: string;
}

export interface GADimension {
  name: string;
  value: string;
}

export interface GARow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

export interface GAResponse {
  rows?: GARow[];
  totals?: GARow[];
  rowCount?: number;
  metadata?: {
    currencyCode?: string;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class GoogleAnalyticsClient {
  private accessToken: string;
  private propertyId: string;

  constructor(accessToken: string, propertyId: string) {
    this.accessToken = accessToken;
    this.propertyId = propertyId;
  }

  private async runReport(body: object): Promise<GAResponse> {
    const response = await fetch(
      `${GA_API_BASE}/${this.propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch GA data");
    }

    return response.json();
  }

  // Get total visitors and sessions
  async getTrafficOverview(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "newUsers" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "screenPageViewsPerSession" },
      ],
    });

    const values = response.rows?.[0]?.metricValues || [];
    return {
      activeUsers: parseInt(values[0]?.value || "0"),
      sessions: parseInt(values[1]?.value || "0"),
      pageViews: parseInt(values[2]?.value || "0"),
      newUsers: parseInt(values[3]?.value || "0"),
      avgSessionDuration: parseFloat(values[4]?.value || "0"),
      bounceRate: parseFloat(values[5]?.value || "0") * 100, // GA returns as decimal, convert to percentage
      pagesPerSession: parseFloat(values[6]?.value || "0"),
    };
  }

  // Get traffic by day for charts
  async getTrafficByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get traffic by country
  async getTrafficByCountry(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get demographics - age
  async getDemographicsAge(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "userAgeBracket" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "userAgeBracket" } }],
    });

    return (response.rows || []).map((row) => ({
      ageGroup: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get demographics - gender
  async getDemographicsGender(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "userGender" }],
      metrics: [{ name: "activeUsers" }],
    });

    return (response.rows || []).map((row) => ({
      gender: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get device category breakdown
  async getDeviceCategory(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    return (response.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get user interests
  async getUserInterests(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "brandingInterest" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      interest: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get traffic sources / acquisition
  async getTrafficSources(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get top pages
  async getTopPages(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "/",
      pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get daily traffic with event counts for website traffic chart
  async getDailyWebsiteTraffic(dateRange: DateRange, ctaEventNames: string[] = ["click", "cta_click", "button_click"]) {
    // Get daily active users
    const trafficResponse = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Get daily CTA/click events
    const eventsResponse = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: ctaEventNames,
          },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Create a map of events by date
    const eventsByDate = new Map<string, number>();
    (eventsResponse.rows || []).forEach((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const count = parseInt(row.metricValues?.[0]?.value || "0");
      eventsByDate.set(date, (eventsByDate.get(date) || 0) + count);
    });

    // Combine traffic and events data
    return (trafficResponse.rows || []).map((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      return {
        date,
        activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
        ctaClicks: eventsByDate.get(date) || 0,
      };
    });
  }

  // Get event counts for specific events
  async getEventCounts(dateRange: DateRange, eventNames: string[]) {
    // If no specific events, get all events
    const dimensionFilter = eventNames.length > 0
      ? {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: eventNames,
            },
          },
        }
      : undefined;

    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 100,
    });

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Build a dimension filter for specific campaign IDs
  private buildCampaignIdFilter(campaignIds?: string[]) {
    if (!campaignIds?.length) return undefined;
    return {
      filter: {
        fieldName: "sessionCampaignId",
        inListFilter: { values: campaignIds },
      },
    };
  }

  // Get Google Ads overview metrics (via GA4 linked data)
  async getAdsOverview(dateRange: DateRange, campaignIds?: string[]) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
        { name: "advertiserAdCostPerConversion" },
        { name: "returnOnAdSpend" },
      ],
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
    });

    // Aggregate across all campaigns
    let clicks = 0, cost = 0, impressions = 0, totalConversions = 0;
    let hasConversionData = false;
    for (const row of response.rows || []) {
      const rowClicks = parseInt(row.metricValues?.[0]?.value || "0");
      const rowCost = parseFloat(row.metricValues?.[1]?.value || "0");
      const rowImpressions = parseInt(row.metricValues?.[2]?.value || "0");
      const rowCostPerConv = parseFloat(row.metricValues?.[3]?.value || "0");

      clicks += rowClicks;
      cost += rowCost;
      impressions += rowImpressions;

      // Derive conversions from cost and costPerConversion (real Google Ads data)
      if (rowCostPerConv > 0 && rowCost > 0) {
        totalConversions += Math.round(rowCost / rowCostPerConv);
        hasConversionData = true;
      }
    }

    return {
      clicks,
      cost,
      impressions,
      conversions: totalConversions,
      hasConversionData,
      cpc: clicks > 0 ? cost / clicks : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      costPerConversion: totalConversions > 0 ? cost / totalConversions : 0,
      currencyCode: response.metadata?.currencyCode || "USD",
    };
  }

  // Get Google Ads spend and clicks by day (with campaign breakdown for filtering)
  async getAdsByDay(dateRange: DateRange, campaignIds?: string[]) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
    });

    // Return raw data with campaign names for client-side filtering
    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      campaign: row.dimensionValues?.[1]?.value || "(not set)",
      clicks: parseInt(row.metricValues?.[0]?.value || "0"),
      cost: parseFloat(row.metricValues?.[1]?.value || "0"),
      impressions: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get Google Ads campaign performance
  async getAdsCampaigns(dateRange: DateRange, limit = 10, campaignIds?: string[]) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
        { name: "advertiserAdCostPerConversion" },
      ],
      orderBys: [{ metric: { metricName: "advertiserAdCost" }, desc: true }],
      limit,
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
    });

    return (response.rows || []).map((row) => {
      const clicks = parseInt(row.metricValues?.[0]?.value || "0");
      const cost = parseFloat(row.metricValues?.[1]?.value || "0");
      const impressions = parseInt(row.metricValues?.[2]?.value || "0");
      const costPerConv = parseFloat(row.metricValues?.[3]?.value || "0");

      // Derive conversions from Google Ads cost/costPerConversion
      const conversions = costPerConv > 0 && cost > 0 ? Math.round(cost / costPerConv) : 0;

      return {
        campaign: row.dimensionValues?.[0]?.value || "(not set)",
        clicks,
        cost,
        impressions,
        conversions,
        costPerConversion: costPerConv,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? cost / clicks : 0,
      };
    });
  }

  // Get real Google Ads conversions (from advertiserAdCostPerConversion)
  async getAdsConversions(dateRange: DateRange, campaignIds?: string[]) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdCost" },
        { name: "advertiserAdCostPerConversion" },
      ],
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
    });

    // Aggregate conversions derived from cost and costPerConversion
    let totalCost = 0, totalConversions = 0;
    for (const row of response.rows || []) {
      const rowCost = parseFloat(row.metricValues?.[0]?.value || "0");
      const rowCostPerConv = parseFloat(row.metricValues?.[1]?.value || "0");

      totalCost += rowCost;
      if (rowCostPerConv > 0 && rowCost > 0) {
        totalConversions += Math.round(rowCost / rowCostPerConv);
      }
    }

    return {
      conversions: totalConversions,
      costPerConversion: totalConversions > 0 ? totalCost / totalConversions : 0,
    };
  }

  // Get real Google Ads conversions by day (with campaign breakdown for filtering)
  async getConversionsByDay(dateRange: DateRange, campaignIds?: string[]) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdCost" },
        { name: "advertiserAdCostPerConversion" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
    });

    // Derive conversions from cost / costPerConversion for each day+campaign
    return (response.rows || []).map((row) => {
      const cost = parseFloat(row.metricValues?.[0]?.value || "0");
      const costPerConv = parseFloat(row.metricValues?.[1]?.value || "0");
      const conversions = costPerConv > 0 && cost > 0 ? Math.round(cost / costPerConv) : 0;

      return {
        date: row.dimensionValues?.[0]?.value || "",
        campaign: row.dimensionValues?.[1]?.value || "(not set)",
        conversions,
      };
    });
  }

  // Get browser breakdown
  async getBrowserBreakdown(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      browser: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get operating system breakdown
  async getOSBreakdown(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      os: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get new vs returning users
  async getNewVsReturning(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
    });

    const result = { new: 0, returning: 0, newSessions: 0, returningSessions: 0 };

    (response.rows || []).forEach((row) => {
      const type = row.dimensionValues?.[0]?.value || "";
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");

      if (type === "new") {
        result.new = users;
        result.newSessions = sessions;
      } else if (type === "returning") {
        result.returning = users;
        result.returningSessions = sessions;
      }
    });

    return result;
  }

  // Get new vs returning users by day
  async getNewVsReturningByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "newVsReturning" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Group by date
    const byDate = new Map<string, { new: number; returning: number }>();

    (response.rows || []).forEach((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const type = row.dimensionValues?.[1]?.value || "";
      const users = parseInt(row.metricValues?.[0]?.value || "0");

      if (!byDate.has(date)) {
        byDate.set(date, { new: 0, returning: 0 });
      }

      const entry = byDate.get(date)!;
      if (type === "new") {
        entry.new = users;
      } else if (type === "returning") {
        entry.returning = users;
      }
    });

    return Array.from(byDate.entries()).map(([date, data]) => ({
      date,
      newUsers: data.new,
      returningUsers: data.returning,
    }));
  }

  // Get user engagement metrics
  async getEngagementMetrics(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      metrics: [
        { name: "engagementRate" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
        { name: "screenPageViewsPerSession" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "userEngagementDuration" },
      ],
    });

    const values = response.rows?.[0]?.metricValues || [];
    return {
      engagementRate: parseFloat(values[0]?.value || "0") * 100,
      engagedSessions: parseInt(values[1]?.value || "0"),
      avgSessionDuration: parseFloat(values[2]?.value || "0"),
      pagesPerSession: parseFloat(values[3]?.value || "0"),
      totalSessions: parseInt(values[4]?.value || "0"),
      bounceRate: parseFloat(values[5]?.value || "0") * 100,
      totalEngagementDuration: parseFloat(values[6]?.value || "0"),
    };
  }

  // Get engagement by day
  async getEngagementByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViewsPerSession" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      engagementRate: parseFloat(row.metricValues?.[0]?.value || "0") * 100,
      avgSessionDuration: parseFloat(row.metricValues?.[1]?.value || "0"),
      pagesPerSession: parseFloat(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get landing pages
  async getLandingPages(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "landingPage" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "/",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || "0") * 100,
      avgDuration: parseFloat(row.metricValues?.[3]?.value || "0"),
    }));
  }

  // Get daily traffic broken down by channel group
  async getTrafficByChannelDaily(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      channel: row.dimensionValues?.[1]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get engagement metrics filtered by channel group (Paid Search vs Organic Search etc.)
  async getMetricsByChannel(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViewsPerSession" },
        { name: "engagementRate" },
        { name: "engagedSessions" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return (response.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || "0") * 100,
      avgSessionDuration: parseFloat(row.metricValues?.[3]?.value || "0"),
      pagesPerSession: parseFloat(row.metricValues?.[4]?.value || "0"),
      engagementRate: parseFloat(row.metricValues?.[5]?.value || "0") * 100,
      engagedSessions: parseInt(row.metricValues?.[6]?.value || "0"),
    }));
  }

  // Get landing pages filtered by paid traffic (sessionDefaultChannelGroup = "Paid Search")
  async getPaidLandingPages(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "landingPage" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViewsPerSession" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "sessionDefaultChannelGroup",
          stringFilter: { matchType: "EXACT", value: "Paid Search" },
        },
      },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "/",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || "0") * 100,
      avgDuration: parseFloat(row.metricValues?.[3]?.value || "0"),
      pagesPerSession: parseFloat(row.metricValues?.[4]?.value || "0"),
    }));
  }

  // Get CTA events filtered by channel group
  async getEventsByChannel(dateRange: DateRange, eventNames: string[], channelGroup: string) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "eventName",
                inListFilter: { values: eventNames },
              },
            },
            {
              filter: {
                fieldName: "sessionDefaultChannelGroup",
                stringFilter: { matchType: "EXACT", value: channelGroup },
              },
            },
          ],
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    });

    let totalEvents = 0;
    const events = (response.rows || []).map((row) => {
      const count = parseInt(row.metricValues?.[0]?.value || "0");
      totalEvents += count;
      return {
        eventName: row.dimensionValues?.[0]?.value || "Unknown",
        eventCount: count,
      };
    });

    return { events, totalEvents };
  }

  // Get top events for all users (no channel filter)
  async getTopEvents(dateRange: DateRange, limit = 20) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
      ],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get top events filtered by campaign IDs
  async getTopEventsByCampaign(dateRange: DateRange, campaignIds: string[], limit = 20) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
      ],
      dimensionFilter: this.buildCampaignIdFilter(campaignIds),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get top events filtered by channel group (e.g. "Organic Search")
  async getTopEventsByChannel(dateRange: DateRange, channelGroup: string, limit = 20) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [
        { name: "eventCount" },
        { name: "totalUsers" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "sessionDefaultChannelGroup",
          stringFilter: { matchType: "EXACT", value: channelGroup },
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get total users for paid traffic channel
  async getPaidTrafficUsers(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "sessionDefaultChannelGroup",
          stringFilter: { matchType: "EXACT", value: "Paid Search" },
        },
      },
    });

    const values = response.rows?.[0]?.metricValues || [];
    return {
      activeUsers: parseInt(values[0]?.value || "0"),
      sessions: parseInt(values[1]?.value || "0"),
      newUsers: parseInt(values[2]?.value || "0"),
    };
  }

  // List available GA4 properties for the user
  static async listProperties(accessToken: string) {
    const response = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to list properties");
    }

    const data = await response.json();
    const properties: { id: string; name: string; account: string }[] = [];

    for (const account of data.accountSummaries || []) {
      for (const property of account.propertySummaries || []) {
        properties.push({
          id: property.property,
          name: property.displayName,
          account: account.displayName,
        });
      }
    }

    return properties;
  }
}
