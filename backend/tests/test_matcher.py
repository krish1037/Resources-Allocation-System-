import pytest
from app.services.matcher import (
    haversine_km,
    skill_overlap_score,
    compute_match_score,
    find_best_matches,
)
from app.models.need import NeedRecord
from app.models.volunteer import Volunteer


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def jaipur_centre():
    """Base coordinates: Jaipur city centre."""
    return {"lat": 26.9124, "lng": 75.7873}

@pytest.fixture
def food_need(jaipur_centre):
    return NeedRecord(
        id="need-001",
        need_type="food",
        location_description="Malviya Nagar, Jaipur",
        lat=jaipur_centre["lat"],
        lng=jaipur_centre["lng"],
        urgency_score=4,
        affected_count=80,
        description="Food shortage affecting 80 families.",
        status="open",
        priority_score=7.5,
    )

@pytest.fixture
def medical_need(jaipur_centre):
    return NeedRecord(
        id="need-002",
        need_type="medical",
        location_description="Vaishali Nagar, Jaipur",
        lat=26.9010,
        lng=75.7420,
        urgency_score=5,
        affected_count=15,
        description="Urgent medical supplies needed.",
        status="open",
        priority_score=9.2,
    )

@pytest.fixture
def nearby_volunteer(jaipur_centre):
    """A volunteer 1km from city centre with matching skills."""
    return Volunteer(
        id="vol-001",
        name="Priya Sharma",
        email="priya@example.com",
        skills=["food_distribution", "general"],
        availability=True,
        lat=jaipur_centre["lat"] + 0.009,   # ~1km north
        lng=jaipur_centre["lng"],
    )

@pytest.fixture
def faraway_volunteer():
    """A volunteer 25km away — beyond the 20km scoring cutoff."""
    return Volunteer(
        id="vol-002",
        name="Rahul Verma",
        email="rahul@example.com",
        skills=["food_distribution"],
        availability=True,
        lat=27.1300,    # ~25km north of Jaipur centre
        lng=75.7873,
    )

@pytest.fixture
def unavailable_volunteer(jaipur_centre):
    """A volunteer who is marked unavailable."""
    return Volunteer(
        id="vol-003",
        name="Sita Devi",
        email="sita@example.com",
        skills=["medical", "counseling"],
        availability=False,
        lat=jaipur_centre["lat"],
        lng=jaipur_centre["lng"],
    )

@pytest.fixture
def medical_volunteer(jaipur_centre):
    """A volunteer 2km away with medical skills."""
    return Volunteer(
        id="vol-004",
        name="Dr. Anil Gupta",
        email="anil@example.com",
        skills=["medical", "counseling"],
        availability=True,
        lat=jaipur_centre["lat"] - 0.018,   # ~2km south
        lng=jaipur_centre["lng"] + 0.005,
    )

@pytest.fixture
def wrong_skills_volunteer(jaipur_centre):
    """Available and nearby but has no relevant skills for food needs."""
    return Volunteer(
        id="vol-005",
        name="Karan Singh",
        email="karan@example.com",
        skills=["construction"],
        availability=True,
        lat=jaipur_centre["lat"] + 0.005,
        lng=jaipur_centre["lng"] + 0.005,
    )


# ── haversine_km ──────────────────────────────────────────────────────────────

class TestHaversineKm:
    def test_same_point_is_zero(self, jaipur_centre):
        d = haversine_km(
            jaipur_centre["lat"], jaipur_centre["lng"],
            jaipur_centre["lat"], jaipur_centre["lng"]
        )
        assert d == pytest.approx(0.0, abs=0.001)

    def test_known_distance_jaipur_to_ajmer(self):
        # Jaipur (26.9124, 75.7873) to Ajmer (26.4499, 74.6399)
        # Known road distance ~135km, straight-line ~130km
        d = haversine_km(26.9124, 75.7873, 26.4499, 74.6399)
        assert 125 < d < 140

    def test_one_km_offset_north(self, jaipur_centre):
        # 0.009 degrees latitude ≈ 1km
        d = haversine_km(
            jaipur_centre["lat"], jaipur_centre["lng"],
            jaipur_centre["lat"] + 0.009, jaipur_centre["lng"]
        )
        assert d == pytest.approx(1.0, abs=0.15)

    def test_symmetry(self, jaipur_centre):
        lat2, lng2 = 26.8647, 75.8028
        d1 = haversine_km(jaipur_centre["lat"], jaipur_centre["lng"], lat2, lng2)
        d2 = haversine_km(lat2, lng2, jaipur_centre["lat"], jaipur_centre["lng"])
        assert d1 == pytest.approx(d2, abs=0.001)

    def test_returns_float(self, jaipur_centre):
        d = haversine_km(
            jaipur_centre["lat"], jaipur_centre["lng"],
            26.8647, 75.8028
        )
        assert isinstance(d, float)


# ── skill_overlap_score ───────────────────────────────────────────────────────

class TestSkillOverlapScore:
    def test_perfect_match_food(self):
        score = skill_overlap_score("food", ["food_distribution", "general"])
        assert score == pytest.approx(1.0)

    def test_perfect_match_medical(self):
        score = skill_overlap_score("medical", ["medical", "counseling"])
        assert score == pytest.approx(1.0)

    def test_partial_match(self):
        score = skill_overlap_score("food", ["food_distribution"])
        assert 0.0 < score < 1.0

    def test_no_match_returns_zero(self):
        score = skill_overlap_score("food", ["construction"])
        assert score == pytest.approx(0.0)

    def test_general_skill_matches_all_types(self):
        for need_type in ["food", "medical", "shelter", "water", "education", "other"]:
            score = skill_overlap_score(need_type, ["general"])
            assert score > 0.0, f"Expected general to match {need_type}"

    def test_unknown_need_type_does_not_crash(self):
        score = skill_overlap_score("unknown_type", ["general"])
        assert isinstance(score, float)

    def test_score_is_between_zero_and_one(self):
        for need_type in ["food", "medical", "shelter", "water", "education"]:
            score = skill_overlap_score(need_type, ["medical", "food_distribution", "general"])
            assert 0.0 <= score <= 1.0


# ── compute_match_score ───────────────────────────────────────────────────────

class TestComputeMatchScore:
    def test_nearby_matching_volunteer_scores_high(self, food_need, nearby_volunteer):
        score = compute_match_score(food_need, nearby_volunteer)
        assert score >= 60.0, f"Expected >= 60, got {score}"

    def test_faraway_volunteer_scores_low(self, food_need, faraway_volunteer):
        score = compute_match_score(food_need, faraway_volunteer)
        assert score < 40.0, f"Expected < 40, got {score}"

    def test_wrong_skills_reduces_score(self, food_need, wrong_skills_volunteer):
        # Nearby but no food skills — score should be lower than nearby_volunteer
        score_wrong = compute_match_score(food_need, wrong_skills_volunteer)
        nearby = pytest.fixture(lambda: None)  # just compute inline
        from app.models.volunteer import Volunteer
        good_vol = Volunteer(
            id="x", name="X", email="x@x.com",
            skills=["food_distribution", "general"],
            availability=True,
            lat=food_need.lat + 0.009,
            lng=food_need.lng,
        )
        score_good = compute_match_score(food_need, good_vol)
        assert score_wrong < score_good

    def test_score_is_between_zero_and_100(self, food_need, nearby_volunteer):
        score = compute_match_score(food_need, nearby_volunteer)
        assert 0.0 <= score <= 100.0

    def test_high_urgency_increases_score(self, jaipur_centre, nearby_volunteer):
        low_urgency = NeedRecord(
            id="low", need_type="food",
            location_description="Jaipur",
            lat=jaipur_centre["lat"], lng=jaipur_centre["lng"],
            urgency_score=1, affected_count=5,
            description="Minor food shortage.", status="open",
        )
        high_urgency = NeedRecord(
            id="high", need_type="food",
            location_description="Jaipur",
            lat=jaipur_centre["lat"], lng=jaipur_centre["lng"],
            urgency_score=5, affected_count=200,
            description="Critical food shortage.", status="open",
        )
        score_low = compute_match_score(low_urgency, nearby_volunteer)
        score_high = compute_match_score(high_urgency, nearby_volunteer)
        assert score_high > score_low

    def test_score_returns_float(self, food_need, nearby_volunteer):
        score = compute_match_score(food_need, nearby_volunteer)
        assert isinstance(score, float)


# ── find_best_matches ─────────────────────────────────────────────────────────

class TestFindBestMatches:
    @pytest.mark.asyncio
    async def test_returns_top_n_results(
        self, food_need, nearby_volunteer, medical_volunteer,
        wrong_skills_volunteer, faraway_volunteer
    ):
        volunteers = [nearby_volunteer, medical_volunteer, wrong_skills_volunteer, faraway_volunteer]
        results = await find_best_matches(food_need, volunteers, top_n=2)
        assert len(results) == 2

    @pytest.mark.asyncio
    async def test_best_match_is_first(self, food_need, nearby_volunteer, faraway_volunteer):
        results = await find_best_matches(food_need, [faraway_volunteer, nearby_volunteer], top_n=2)
        best_volunteer, best_score = results[0]
        assert best_volunteer.id == nearby_volunteer.id

    @pytest.mark.asyncio
    async def test_excludes_unavailable_volunteers(
        self, food_need, unavailable_volunteer, nearby_volunteer
    ):
        results = await find_best_matches(
            food_need, [unavailable_volunteer, nearby_volunteer], top_n=3
        )
        ids = [v.id for v, _ in results]
        assert unavailable_volunteer.id not in ids
        assert nearby_volunteer.id in ids

    @pytest.mark.asyncio
    async def test_returns_empty_when_no_volunteers(self, food_need):
        results = await find_best_matches(food_need, [], top_n=3)
        assert results == []

    @pytest.mark.asyncio
    async def test_returns_empty_when_all_unavailable(
        self, food_need, unavailable_volunteer
    ):
        results = await find_best_matches(food_need, [unavailable_volunteer], top_n=3)
        assert results == []

    @pytest.mark.asyncio
    async def test_results_sorted_descending_by_score(
        self, food_need, nearby_volunteer, faraway_volunteer, wrong_skills_volunteer
    ):
        results = await find_best_matches(
            food_need,
            [faraway_volunteer, wrong_skills_volunteer, nearby_volunteer],
            top_n=3
        )
        scores = [score for _, score in results]
        assert scores == sorted(scores, reverse=True)

    @pytest.mark.asyncio
    async def test_top_n_larger_than_pool_returns_all_available(
        self, food_need, nearby_volunteer, faraway_volunteer
    ):
        results = await find_best_matches(
            food_need, [nearby_volunteer, faraway_volunteer], top_n=10
        )
        assert len(results) == 2

    @pytest.mark.asyncio
    async def test_medical_volunteer_preferred_for_medical_need(
        self, medical_need, medical_volunteer, nearby_volunteer
    ):
        # nearby_volunteer has food skills, medical_volunteer has medical skills
        # For a medical need, medical_volunteer should rank higher
        # even if nearby_volunteer is slightly closer
        results = await find_best_matches(
            medical_need, [nearby_volunteer, medical_volunteer], top_n=2
        )
        best_id = results[0][0].id
        assert best_id == medical_volunteer.id
