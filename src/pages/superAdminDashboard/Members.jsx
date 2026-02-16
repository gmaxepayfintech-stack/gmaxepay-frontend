const Onboarding = "/img/Onboarding.png";
const RevenueGenerated = "/img/RevenueGenerated.png";
const TotalMembers = "/img/TotalMembers.png";
const ActiveMembers = "/img/ActiveMembers.png";
const summaryItems = [
  {
    label: "Total Members",
    value: "40,238",
    change: "▲ 4.61%",
    isUp: true,
    icon: TotalMembers,
    iconBgClass: "bg-[#0982E6] border-Opacity-80",
    textColorClass: "text-[#0982E6]",
    borderLeftClass: "border-[#0982E6]",
  },
  {
    label: "Active Members",
    value: "39,238",
    change: "▲ 8.1%",
    isUp: true,
    icon: ActiveMembers,
    iconBgClass: "bg-[#B0A933]",
    textColorClass: "text-[#B0A933]",
    borderLeftClass: "border-[#B0A933]",
  },
  {
    label: "Onboarding Pending",
    value: "38",
    change: "▲ 1.25%",
    isUp: false,
    icon: Onboarding,
    iconBgClass: "bg-[#DD5A32]",
    textColorClass: "text-[#DD5A32]",
    borderLeftClass: "border-[#DD5A32]",
  },
  {
    label: "Revenue Generated",
    value: "40,238",
    change: "▲ 20.61%",
    isUp: true,
    icon: RevenueGenerated,
    iconBgClass: "bg-[#039155]",
    textColorClass: "text-[#039155]",
    borderLeftClass: "border-[#039155]",
  },
];

// --- (Member List Data - Unchanged) ---

const activeMembers = [
  { name: "Rohan G", status: "Online", avatar: "/avatar.png" },
  { name: "Rohan G", status: "Offline", avatar: "/avatar.png" },
  { name: "Rohan G", status: "Online", avatar: "/avatar.png" },
  { name: "Rohan G", status: "Offline", avatar: "/avatar.png" },
  { name: "Rohan G", status: "Online", avatar: "/avatar.png" },
];

const onboardMembers = [
  { name: "Rohan (New Member)", company: "Company Name" },
  { name: "Rohan (New Member)", company: "Company Name" },
  { name: "Rohan (New Member)", company: "Company Name" },
  { name: "Rohan (New Member)", company: "Company Name" },
  { name: "Rohan (New Member)", company: "Company Name" },
  { name: "Rohan (New Member)", company: "Company Name" },
];

const Members = () => (
  <div className="px-3 py-4 min-h-screen bg-[#FAFAFA] text-[#1B1717]">
    <h2 className="text-2xl font-md mb-6">Members</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryItems.map((item, idx) => (
        <div
          key={idx}
          // Added border-l-4 for a thick left border and rounded-xl for corner styling
          className={`bg-white rounded-xl  p-4 border    border-l-4 ${item.borderLeftClass} flex items-center justify-between`}
        >
          {/* Left Section: Label, Value, Change */}
          <div className="flex flex-col justify-start">
            {/* Label */}
            <div className="text-[#1B1717] text-base font-[Gilroy-Medium] mb-1">
              {item.label}
            </div>
            {/* Value */}
            <div className="text-2xl font-[Gilroy-Semibold] text-[#1B1717] leading-none">
              {item.value}
            </div>
            {/* Change Percentage */}
            <div
              className={`text-sm font-[Gilroy-Semibold] mt-2 flex items-center ${item.textColorClass}`}
            >
              {item.change}
            </div>
          </div>

          {/* Right Section: Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Most Active Members */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-[Gilroy-Medium] text-lg mb-5">Most Active Members</h3>
        {activeMembers.map((member, idx) => (
          <div key={idx} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="font-[Gilroy-Medium] text-[#1B1717]">{member.name}</div>
              </div>
              <span
                className={`text-sm font-[Gilroy-Medium] ${
                  member.status === "Online"
                    ? "text-green-500"
                    : "text-gray-400"
                } flex items-center gap-1`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    member.status === "Online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
                {member.status}
              </span>
            </div>

            {/* Separator line */}
            {idx !== activeMembers.length - 1 && (
              <hr className="border-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Recent Onboard Members */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-[Gilroy-Medium] text-lg mb-5">Recent Onboard Members</h3>
        {onboardMembers.map((member, idx) => (
          <div key={idx} className="mb-4 last:mb-0">
            <div className="flex items-center">
              <span className="text-green-500 font-[Gilroy-Semibold] mr-2">●</span>
              <span className="font-[Gilroy-Medium] text-[#1B1717]">{member.name}</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 ml-4">
              {member.company}
            </div>

            {/* Separator line */}
            {idx !== onboardMembers.length - 1 && (
              <hr className="border-gray-200 mt-3" />
            )}
          </div>
        ))}
      </div>

      {/* Onboard Pending */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-[Gilroy-Medium] text-lg mb-5">Onboard Pending</h3>
        {onboardMembers.map((member, idx) => (
          <div key={idx} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-red-500 font-[Gilroy-Semibold] mr-2">●</span>
                <span className="font-[Gilroy-Medium] text-[#1B1717]">
                  {member.name}
                </span>
                <div className="text-sm text-gray-500 mt-0.5 ml-4">
                  {member.company}
                </div>
              </div>
              <span className="bg-[#FFF4F3] text-red-500 px-3 py-1 rounded-lg text-xs font-[Gilroy-Medium] border border-red-300">
                Pending
              </span>
            </div>

            {/* Separator line */}
            {idx !== onboardMembers.length - 1 && (
              <hr className="border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Members;
