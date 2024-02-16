import React, {
	HtmlHTMLAttributes,
	PropsWithChildren,
	createContext,
	useEffect,
} from "react";

const TabContext = createContext<null | {
	activeTab: string | undefined;
	setActiveTab: (index: string) => void;
	tabs: { label: string; value: string }[];
}>(null);

const useTabContext = () => {
	const context = React.useContext(TabContext);

	if (!context) {
		throw new Error(
			"Tab compound components cannot be rendered outside the Tab component"
		);
	}

	return context;
};

type TabGroupProps = PropsWithChildren<
	HtmlHTMLAttributes<HTMLDivElement> & {
		tabs: { label: string; value: string }[];
	}
>;

const TabGroup = ({ children, tabs, ...props }: TabGroupProps) => {
	const [activeTab, setActiveTab] = React.useState<string>();

	const onChangeTab = (value: string) => {
		setActiveTab(value);
	};

	useEffect(() => {
		if (tabs.length > 0) {
			setActiveTab(tabs[0].value);
		}
	}, []);

	return (
		<TabContext.Provider
			value={{
				activeTab,
				setActiveTab,
				tabs,
			}}
		>
			<div {...props}>
				<TabList>
					{tabs.map((tab, index) => (
						<Tab
							key={index}
							onClick={() => onChangeTab(tab.value)}
							isActive={activeTab === tab.value}
						>
							{tab.label}
						</Tab>
					))}
				</TabList>

				{children}
			</div>
		</TabContext.Provider>
	);
};

const TabList = ({ children }: PropsWithChildren) => {
	return <div className="tab-list">{children}</div>;
};

const Tab = ({
	children,
	isActive,
	...props
}: PropsWithChildren<
	HtmlHTMLAttributes<HTMLButtonElement> & { isActive: boolean }
>) => {
	return (
		<button {...props} className={`tab-item ${isActive ? "active" : ""}`}>
			{children}
		</button>
	);
};

const TabPanels = ({ children }: PropsWithChildren) => {
	return <div className="tab-panels">{children}</div>;
};

const TabPanel = ({
	children,
	value,
}: PropsWithChildren<{ value: string }>) => {
	const { activeTab } = useTabContext();

	return (
		<div className={`tab-panel ${activeTab === value ? "active" : ""}`}>
			{children}
		</div>
	);
};

export default Object.assign(Tab, {
	Group: TabGroup,
	List: TabList,
	Panels: TabPanels,
	Panel: TabPanel,
});
